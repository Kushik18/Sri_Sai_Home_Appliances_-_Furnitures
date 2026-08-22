"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function updateEnquiryStatus(id: string, status: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  await prisma.enquiry.update({
    where: { id },
    data: { status }
  })
  revalidatePath("/admin/enquiries")
  revalidatePath("/admin")
}
