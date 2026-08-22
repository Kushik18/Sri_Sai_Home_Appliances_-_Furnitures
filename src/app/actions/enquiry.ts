"use server"

import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { checkRateLimit } from "@/lib/rateLimit"

const enquirySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
  phone: z.string().regex(/^[0-9+\s\-]{7,15}$/, "Invalid phone number"),
  preferWhatsapp: z.boolean(),
  message: z.string().max(1000, "Message too long").optional().default(""),
  productId: z.string().uuid().optional().or(z.literal("")),
  storeType: z.string().min(1),
  sessionId: z.string().min(1).max(100),
})

export async function submitEnquiry(data: {
  name: string
  phone: string
  preferWhatsapp: boolean
  message: string
  productId?: string
  storeType: string
  sessionId: string
}) {
  const validated = enquirySchema.safeParse(data)
  if (!validated.success) {
    throw new Error("Invalid enquiry data: " + validated.error.issues.map(i => i.message).join(", "))
  }

  // Rate limit: max 5 enquiries per 10 minutes per session
  const { success } = checkRateLimit(`enquiry:${validated.data.sessionId}`, 5, 600_000)
  if (!success) {
    throw new Error("Too many enquiry submissions. Please try again later.")
  }

  await prisma.enquiry.create({
    data: {
      name: validated.data.name,
      phone: validated.data.phone,
      preferWhatsapp: validated.data.preferWhatsapp,
      message: validated.data.message || "",
      productId: validated.data.productId || null,
      storeType: validated.data.storeType,
      sessionId: validated.data.sessionId,
    }
  })
}
