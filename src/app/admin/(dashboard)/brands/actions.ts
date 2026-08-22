"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import cloudinary from "@/lib/cloudinary"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function uploadBrandLogo(store: string, name: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const file = formData.get("image") as File;
  
  if (!file || file.size === 0) {
    throw new Error("No file provided");
  }

  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"]
  if (!allowedTypes.includes(file.type)) {
    throw new Error(`Invalid file type: ${file.type}. Only image files are allowed.`)
  }
  if (file.size > 10 * 1024 * 1024) {
    throw new Error("File too large. Maximum 10MB allowed.")
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64String = `data:${file.type};base64,${buffer.toString('base64')}`;

  try {
    const uploadResponse = await cloudinary.uploader.upload(base64String, {
      folder: "sri-sai-brands"
    });
    
    // Get current max order scoped by store
    const maxOrderLogo = await prisma.brandLogo.findFirst({
      where: { store },
      orderBy: { order: 'desc' }
    });
    
    const newOrder = maxOrderLogo ? maxOrderLogo.order + 1 : 0;

    await prisma.brandLogo.create({
      data: {
        store,
        name,
        url: uploadResponse.secure_url,
        publicId: uploadResponse.public_id,
        order: newOrder
      }
    });

    revalidatePath("/admin/brands");
    revalidatePath("/");
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("Failed to upload brand logo");
  }
}

export async function deleteBrandLogo(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const logo = await prisma.brandLogo.findUnique({ where: { id } });
  
  if (logo) {
    if (logo.publicId) {
      try {
        await cloudinary.uploader.destroy(logo.publicId);
      } catch (error) {
        console.error("Failed to delete from Cloudinary:", error);
      }
    }
    
    await prisma.brandLogo.delete({ where: { id } });
    revalidatePath("/admin/brands");
    revalidatePath("/");
  }
}

export async function reorderBrandLogos(items: { id: string; order: number }[]) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  // Use sequential updates
  for (const item of items) {
    await prisma.brandLogo.update({
      where: { id: item.id },
      data: { order: item.order }
    });
  }
  revalidatePath("/admin/brands");
  revalidatePath("/");
}

export async function updateBrandLogoSize(id: string, size: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  await prisma.brandLogo.update({
    where: { id },
    data: { size }
  });
  revalidatePath("/admin/brands");
  revalidatePath("/");
}

export async function updateBrandLogoInvert(id: string, invertInDark: boolean) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  await prisma.brandLogo.update({
    where: { id },
    data: { invertInDark }
  });
  revalidatePath("/admin/brands");
  revalidatePath("/");
}
