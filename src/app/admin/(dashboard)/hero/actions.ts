"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import cloudinary from "@/lib/cloudinary"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function uploadHeroImage(store: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const file = formData.get("image") as File;
  
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Only JPEG, PNG, WebP, GIF, and AVIF are allowed.`)
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File too large. Maximum 10MB allowed.")
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

  try {
    const uploadResponse = await cloudinary.uploader.upload(base64String, {
      folder: "sri-sai-hero"
    });
    
    // Get current max order
    const maxOrderImage = await prisma.heroImage.findFirst({
      where: { store },
      orderBy: { order: 'desc' }
    });
    
    const newOrder = maxOrderImage ? maxOrderImage.order + 1 : 0;

    await prisma.heroImage.create({
      data: {
        store,
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        order: newOrder
      }
    });

    revalidatePath("/admin/hero");
    revalidatePath("/");
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload image");
  }
}

export async function deleteHeroImage(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const image = await prisma.heroImage.findUnique({ where: { id } });
  
  if (image) {
    if (image.publicId) {
      try {
        await cloudinary.uploader.destroy(image.publicId);
      } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
      }
    }
    
    await prisma.heroImage.delete({ where: { id } });
    revalidatePath("/admin/hero");
    revalidatePath("/");
  }
}

export async function reorderHeroImages(items: { id: string; order: number }[]) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  // Use sequential updates or a transaction
  for (const item of items) {
    await prisma.heroImage.update({
      where: { id: item.id },
      data: { order: item.order }
    });
  }
  revalidatePath("/admin/hero");
  revalidatePath("/");
}
