import { PrismaClient } from '@prisma/client';
import axios from 'axios';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const GROQ_API_KEY = process.env.GROQ_API_KEY;

const REPORTS_DIR = path.join(__dirname, 'reports');
if (!fs.existsSync(REPORTS_DIR)) {
  fs.mkdirSync(REPORTS_DIR);
}

const ENRICHED_FILE = path.join(REPORTS_DIR, 'enriched.txt');
const NEEDS_IMAGE_FILE = path.join(REPORTS_DIR, 'needs_image.txt');
const SKIPPED_FILE = path.join(REPORTS_DIR, 'skipped.txt');

// Reset reports on new run
fs.writeFileSync(ENRICHED_FILE, '');
fs.writeFileSync(NEEDS_IMAGE_FILE, '');
fs.writeFileSync(SKIPPED_FILE, '');

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const skipPatterns = [
  "TRANSPORT CHARGES", "CHARGES", "SERVICE CHARGE", "GIFT BAG", 
  "GASKET", "GIFT BOX", "DEMO -", "IFC INVOICE", "TALLY", "PRINTER SERVICE",
  "1-Apr-26 to 29-Jun-26", "150902 - 3188-01A"
];

function shouldSkip(productName: string): boolean {
  const upper = productName.toUpperCase();
  for (const pattern of skipPatterns) {
    if (upper.includes(pattern.toUpperCase())) {
      return true;
    }
  }
  return false;
}

function logToReport(file: string, message: string) {
  console.log(message);
  fs.appendFileSync(file, `${message}\n`);
}

async function getGroqContent(productName: string) {
  if (!GROQ_API_KEY) throw new Error("Missing GROQ_API_KEY");

  const prompt = `You are a product description writer for an Indian home appliance and furniture retail store. Given this product name: ${productName}, write the following in JSON format only: description (2-3 accurate sentences about what this product is and its key benefits), short_description (one sentence), specs (key-value pairs of the most important specifications like capacity, wattage, dimensions, color, material — only include specs you are confident about for this specific product), category_confirmed (the correct product category). Do not guess or invent specifications you are not sure about. Return only valid JSON, no other text.`;

  const response = await axios.post(
    `https://api.groq.com/openai/v1/chat/completions`,
    {
      model: "llama-3.1-8b-instant",
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" }
    },
    {
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    }
  );

  const text = response.data.choices[0].message.content;
  return JSON.parse(text);
}

async function searchWikimedia(query: string): Promise<string | null> {
  try {
    const res = await axios.get('https://commons.wikimedia.org/w/api.php', {
      params: {
        action: 'query',
        list: 'search',
        srsearch: query,
        srnamespace: 6, // File namespace
        format: 'json'
      },
      headers: { 'User-Agent': 'SriSaiApp/1.0 (contact@srisai.com)' }
    });

    const searchResults = res.data.query?.search;
    if (searchResults && searchResults.length > 0) {
      const title = searchResults[0].title;
      // Convert to Special:FilePath URL to get the direct file
      return `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(title)}`;
    }
    return null;
  } catch (err: any) {
    console.error("Wikimedia API error:", err.message);
    return null;
  }
}

async function uploadToCloudinary(imageUrl: string): Promise<string> {
  const result = await cloudinary.uploader.upload(imageUrl, {
    folder: 'srisai_products',
  });
  return result.secure_url;
}

async function main() {
  console.log("--- Starting Enrichment Job ---");

  if (!process.env.CLOUDINARY_CLOUD_NAME || !GROQ_API_KEY) {
    console.error("Missing required environment variables (CLOUDINARY or GROQ).");
    process.exit(1);
  }

  // Fetch products that need either description or image
  const products = await prisma.product.findMany({
    where: {
      status: 'PUBLISHED',
      OR: [
        { description: null },
        { description: '' },
        { imageUrls: { isEmpty: true } }
      ]
    }
  });

  console.log(`Found ${products.length} products to evaluate.`);

  for (let i = 0; i < products.length; i++) {
    const product = products[i];
    console.log(`\n[${i+1}/${products.length}] Processing: ${product.name}`);

    // Skip junk
    if (shouldSkip(product.name)) {
      logToReport(SKIPPED_FILE, `SKIPPED (Junk Row): ${product.name}`);
      continue;
    }

    try {
      let finalDescription = product.description;
      let finalSpecs = product.specs;
      let imageUrls = product.imageUrls;

      // 1. Get Description/Specs if missing
      if (!product.description || product.description.trim() === '') {
        console.log(`  Generating description via Groq...`);
        const aiData = await getGroqContent(product.name);
        
        // Use only the detailed description to avoid redundancy
        finalDescription = aiData.description;
        finalSpecs = aiData.specs;
      } else {
        console.log(`  Description already exists, skipping Groq.`);
      }

      // 2. Get Image if missing
      let newImageUrl: string | null = null;
      if (imageUrls.length === 0) {
        console.log(`  Searching for representative image on Wikimedia...`);
        // Use brand + category or just name for search
        const query = product.brand ? `${product.brand} ${product.name}` : product.name;
        
        const wikiUrl = await searchWikimedia(query);
        if (wikiUrl) {
          console.log(`  Found Wikimedia Image, uploading to Cloudinary...`);
          const cloudUrl = await uploadToCloudinary(wikiUrl);
          imageUrls = [cloudUrl];
          newImageUrl = cloudUrl;
        }
      } else {
         console.log(`  Image already exists, skipping Wikimedia.`);
      }

      // 3. Update DB
      await prisma.product.update({
        where: { id: product.id },
        data: {
          description: finalDescription,
          specs: finalSpecs ? finalSpecs : undefined,
          imageUrls: imageUrls
        }
      });

      // 4. Reporting
      if (imageUrls.length > 0) {
        logToReport(ENRICHED_FILE, `ENRICHED: ${product.name} | Image: ${imageUrls[0]}`);
      } else {
        logToReport(NEEDS_IMAGE_FILE, `NEEDS_IMAGE: ${product.name}`);
      }

    } catch (err: any) {
      // Handle rate limits or other errors gracefully
      if (err?.response?.status === 429) {
         console.error(`  🚨 Groq Rate Limit Hit! Script pausing...`);
         break;
      }
      console.error(`  🚨 Error processing ${product.name}: ${err.message}`);
    }

    // Strict 2-second rate limit to stay within Groq free tier
    await sleep(2000);
  }

  console.log("\n--- Enrichment Job Completed ---");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
