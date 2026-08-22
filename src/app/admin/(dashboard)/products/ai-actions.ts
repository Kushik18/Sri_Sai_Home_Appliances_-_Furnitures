"use server"

import { Groq } from "groq-sdk"
import { z } from "zod"

import fs from "fs"
import path from "path"

function getApiKey(): string | undefined {
  try {
    const envPath = path.join(process.cwd(), ".env")
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, "utf8")
      const match = content.match(/GROQ_API_KEY=["']?([^"'\r\n]+)["']?/)
      if (match && match[1]?.trim()) {
        return match[1].trim()
      }
    }
  } catch {}
  return process.env.GROQ_API_KEY
}

function getGroqClient() {
  const apiKey = getApiKey()
  return new Groq({ apiKey })
}

// Primary:  openai/gpt-oss-20b   — fast 20B GPT-OSS model on Groq (production).
// Fallback1: openai/gpt-oss-120b  — larger 120B GPT-OSS model (production).
// Fallback2: qwen/qwen3.6-27b    — Qwen 3.6 27B preview model on Groq.
// Last updated: August 2026 — gemma2-9b-it and llama3-8b-8192 are decommissioned.
const MODEL_CHAIN = [
  "openai/gpt-oss-20b",
  "openai/gpt-oss-120b",
  "qwen/qwen3.6-27b",
]

const productDataSchema = z.object({
  description: z.string().describe("A 2-3 sentence overview of the product."),
  features: z.array(z.string()).describe("A list of key features (About this item)."),
  whatsInTheBox: z.array(z.string()).describe("A list of items included in the box."),
  specs: z.array(z.object({
    category: z.string(),
    key: z.string(),
    value: z.string()
  })).describe("A list of specifications categorized.")
})

export type ProductParseResult = 
  | { success: true; data: z.infer<typeof productDataSchema> }
  | { success: false; error: string; rawText?: string }

// Compact system prompt — fewer prompt tokens = more budget for output.
const SYSTEM_PROMPT = `You are a product data extractor. Extract info from the product text and output ONLY a single valid JSON object.
No thinking. No reasoning. No markdown. No explanation. Just the JSON.

Required JSON structure:
{"description":"2-3 sentence overview","features":["feature1","feature2"],"whatsInTheBox":["item1"],"specs":[{"category":"General","key":"Brand","value":"X"}]}

Rules:
- description: 2-3 SHORT sentences max. Be concise.
- features: up to 15 key bullet points (the most important highlights).
- whatsInTheBox: items from "What's in the Box" / "Package Contents". Empty array [] if not found.
- specs: extract ALL available specifications (up to 50 entries). Group them into logical categories. Use short, descriptive category names like: General, Design, Performance, Connectivity, Display, Audio, Power, Physical, Wash Programs, Smart Features, Warranty, or any other relevant category that fits the product.
- Output ONLY the JSON object. Nothing else.`

function shouldTryNextModel(err: any): boolean {
  const code = err?.error?.error?.code
  if (err?.status === 429 || code === "rate_limit_exceeded") return true
  if (err?.status === 404 || code === "model_not_found" || code === "model_decommissioned") return true
  // json_validate_failed: only retry if nothing was generated (empty response),
  // not if max_tokens was reached on the current model (that won't help).
  if (code === "json_validate_failed") return true
  return false
}

// Free-tier Groq: 8 000 tokens/min shared across models.
// Budget per call: ~6 000 chars input (~1 500 tokens) + 2 000 output = ~3 500 total.
// At 3 500 tokens/call we can make ~2 calls/min safely within the 8 000 token bucket.
const MAX_BODY_CHARS = 6_000
const MAX_BOX_CHARS = 800

function retryWaitMs(err: any): number {
  if (err?.status === 429) return 5_000
  return 500
}

/**
 * Extract the "What's in the Box" block from raw text so we can always
 * include it even when the overall text is too long and gets truncated.
 */
function extractBoxSection(text: string): string {
  const patterns = [
    /what['']?s?\s+in\s+the\s+box[\s\S]{0,500}/i,
    /package\s+contents[\s\S]{0,500}/i,
    /included\s+components?[\s\S]{0,500}/i,
    /in\s+the\s+box[\s\S]{0,500}/i,
    /box\s+contents?[\s\S]{0,500}/i,
  ]
  for (const pat of patterns) {
    const m = text.match(pat)
    if (m) return m[0].trim()
  }
  return ""
}

/**
 * Try to extract a JSON object from a string that may contain
 * surrounding text, reasoning tags, or markdown fences.
 * Handles: Qwen <think> blocks (open or closed), ```json fences, bare JSON, truncated JSON.
 */
function extractJson(raw: string): string {
  // 1. Strip closed <think>...</think> blocks
  let cleaned = raw.replace(/<think>[\s\S]*?<\/think>/gi, "").trim()

  // 2. Strip unclosed <think> block — if model was cut off mid-reasoning,
  //    everything from <think> onwards is reasoning noise, not JSON.
  const unclosedThink = cleaned.search(/<think>/i)
  if (unclosedThink !== -1) {
    cleaned = cleaned.slice(0, unclosedThink).trim()
  }

  // 3. Strip markdown code fences
  const fenced = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (fenced) return fenced[1].trim()

  // 4. Find the first { 
  const start = cleaned.indexOf("{")
  if (start === -1) return cleaned

  // 5. If a closing } exists, extract the complete block
  const end = cleaned.lastIndexOf("}")
  if (end !== -1 && end > start) {
    return cleaned.slice(start, end + 1)
  }

  // 6. JSON was truncated — attempt string-aware auto-close
  const partial = cleaned.slice(start)
  let braces = 0, brackets = 0
  let inString = false, escape = false
  for (const ch of partial) {
    if (escape)       { escape = false; continue }
    if (ch === "\\")   { escape = true;  continue }
    if (ch === '"')   { inString = !inString; continue }
    if (inString)     continue
    if (ch === "{")   braces++
    else if (ch === "}") braces--
    else if (ch === "[") brackets++
    else if (ch === "]") brackets--
  }

  let autoFixed = partial
  if (inString) {
    // We ended inside an open string — close the string first,
    // then close any open arrays/objects.
    autoFixed += '"'
  } else {
    // Not in a string — strip any trailing partial key/value
    autoFixed = partial.replace(/,?\s*$/, "")
  }
  autoFixed += "]".repeat(Math.max(0, brackets)) + "}".repeat(Math.max(0, braces))
  return autoFixed
}

/**
 * Clean common model-output JSON quirks before parsing:
 * - Trailing commas before } or ]
 * - Control characters (\x00-\x1f except \t \n \r)
 * - HTML entities: &amp; &quot; &#39; &lt; &gt;
 */
function cleanJson(str: string): string {
  return str
    .replace(/,\s*([}\]])/g, "$1")           // trailing commas
    .replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g, "") // control chars (keep \t \n \r)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
}

export async function parseProductText(rawText: string): Promise<ProductParseResult> {
  if (!rawText || rawText.trim().length === 0) {
    return { success: false, error: "Input text is empty." }
  }

  // Strip inline base64 images, markdown image links, URLs, and collapse whitespace
  const sanitizedText = rawText
    .replace(/data:image\/[^;]+;base64,[^"'\s\)]+/gi, "")
    .replace(/!\[.*?\]\(.*?\)/gi, "")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")   // collapse [text](url) → text
    .replace(/https?:\/\/\S+/g, "")             // strip bare URLs
    .replace(/\s+/g, " ")
    .trim()

  // Always preserve the box section — extract it before any truncation
  const boxSection = extractBoxSection(sanitizedText)

  // Truncate the main body tightly to stay within token budget
  let mainBody = sanitizedText
  if (sanitizedText.length > MAX_BODY_CHARS) {
    mainBody = sanitizedText.slice(0, MAX_BODY_CHARS)
  }

  // Build final text: main body + box section (deduplicated)
  let trimmedText = mainBody
  if (boxSection && !mainBody.includes(boxSection.slice(0, 40))) {
    const boxSnippet = boxSection.slice(0, MAX_BOX_CHARS)
    trimmedText = mainBody + "\n\nIn the box: " + boxSnippet
  }

  let lastError: any = null

  for (const model of MODEL_CHAIN) {
    try {
      const groq = getGroqClient()
      // No response_format — let the model output free text and extract JSON ourselves.
      // This avoids strict json_validate_failed errors when the model is near token limits.
      const response = await groq.chat.completions.create({
        model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: trimmedText }
        ],
        temperature: 0.1,
        max_tokens: 3000,
      })

      const rawContent = response.choices[0]?.message?.content || ""

      if (!rawContent.trim()) {
        lastError = new Error("Model returned empty response.")
        continue
      }

      const jsonStr = cleanJson(extractJson(rawContent))

      // Guard: if extraction produced nothing (e.g. all tokens spent on think block)
      if (!jsonStr || jsonStr.trim() === "" || jsonStr.trim() === "{}") {
        console.warn(`[AI] Model "${model}" produced no extractable JSON. Trying next model.`)
        lastError = new Error("Empty JSON extracted from model response.")
        continue
      }

      let parsedJson
      try {
        parsedJson = JSON.parse(jsonStr)
      } catch (parseErr) {
        // JSON parse failed — log for diagnostics and try the next model
        console.warn(`[AI] Model "${model}" returned unparseable JSON. Trying next model.`)
        console.warn("[AI] Raw snippet:", rawContent.slice(0, 300))
        lastError = parseErr
        continue
      }

      const validation = productDataSchema.safeParse(parsedJson)
      if (!validation.success) {
        // Schema mismatch — log and try next model
        console.warn(`[AI] Model "${model}" response failed schema validation. Trying next model.`)
        lastError = new Error("Schema mismatch: " + JSON.stringify(validation.error.flatten()))
        continue
      }

      return { success: true, data: validation.data }

    } catch (err: any) {
      lastError = err
      if (shouldTryNextModel(err)) {
        const waitMs = retryWaitMs(err)
        console.warn(`[AI] Model "${model}" unavailable (${err?.status}). Waiting ${waitMs}ms...`)
        await new Promise(r => setTimeout(r, waitMs))
        continue
      }
      // Non-retryable error
      console.error("AI parse error:", err)
      return { success: false, error: err.message || "An unknown error occurred during AI parsing." }
    }
  }

  // All models exhausted
  console.error("AI parse error (all models exhausted):", lastError)
  return {
    success: false,
    error: `⚠️ AI parsing failed. Please wait a moment and try again, or fill in the product details manually.`
  }
}
