"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import cloudinary from "@/lib/cloudinary"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"]
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export async function getProducts() {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  return await prisma.product.findMany({
    include: {
      category: true,
      store: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
}

export async function createProduct(formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const name = formData.get('name') as string
  const storeIdStr = formData.get('storeId') as string
  const categoryIdStr = formData.get('categoryId') as string
  
  const storeId = storeIdStr ? storeIdStr : null
  const categoryId = categoryIdStr ? categoryIdStr : null

  const brand = formData.get('brand') as string
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
  const description = formData.get('description') as string
  const legacyDescription = formData.get('legacyDescription') as string | null
  const inStock = formData.get('inStock') === 'true'
  const isFeatured = formData.get('isFeatured') === 'true'
  
  const material = (formData.get('material') as string) || null
  const color = (formData.get('color') as string) || null
  const dimensions = (formData.get('dimensions') as string) || null

  const featuresStr = formData.get('features') as string
  let features: string[] = []
  if (featuresStr) {
    try { features = JSON.parse(featuresStr) } catch(e) {}
  }

  const whatsInTheBoxStr = formData.get('whatsInTheBox') as string
  let whatsInTheBox: string[] = []
  if (whatsInTheBoxStr) {
    try { whatsInTheBox = JSON.parse(whatsInTheBoxStr) } catch(e) {}
  }

  const images = formData.getAll('images') as File[]
  let imageUrls: string[] = []

  for (const image of images) {
    if (image && image.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        throw new Error(`Invalid file type: ${image.type}. Only JPEG, PNG, WebP, GIF, and AVIF are allowed.`)
      }
      if (image.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${(image.size / 1024 / 1024).toFixed(1)}MB. Maximum 10MB allowed.`)
      }
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64String = `data:${image.type};base64,${buffer.toString('base64')}`

      try {
        const uploadResponse = await cloudinary.uploader.upload(base64String, {
          folder: "sri-sai-products"
        })
        imageUrls.push(uploadResponse.secure_url)
      } catch (error) {
        console.error("Cloudinary upload error:", error)
      }
    }
  }

  const status = (formData.get('status') as string) || "PUBLISHED"

  const specsStr = formData.get('specs') as string
  let specs = {}
  if (specsStr) {
    try { specs = JSON.parse(specsStr) } catch(e) {}
  }

  await prisma.product.create({
    data: {
      name,
      storeId,
      categoryId,
      brand,
      price,
      description,
      legacyDescription,
      features,
      whatsInTheBox,
      inStock,
      isFeatured,
      featuredAt: isFeatured ? new Date() : null,
      stockQuantity: inStock ? 1 : 0,
      imageUrls,
      status,
      specs,
      material,
      color,
      dimensions
    }
  })

  revalidatePath("/admin/products")
}

export async function deleteProduct(id: string) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  try {
    await prisma.product.delete({ where: { id } })
  } catch (err: any) {
    // P2025 = record not found — already deleted or stale UI, treat as success
    if (err?.code !== "P2025") throw err
  }
  revalidatePath("/admin/products")
}

export async function updateProduct(id: string, formData: FormData) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const name = formData.get('name') as string
  const storeIdStr = formData.get('storeId') as string
  const categoryIdStr = formData.get('categoryId') as string
  
  const storeId = storeIdStr ? storeIdStr : null
  const categoryId = categoryIdStr ? categoryIdStr : null

  const brand = formData.get('brand') as string
  const price = formData.get('price') ? parseFloat(formData.get('price') as string) : null
  const description = formData.get('description') as string
  const legacyDescription = formData.get('legacyDescription') as string | null
  const inStock = formData.get('inStock') === 'true'
  const isFeatured = formData.get('isFeatured') === 'true'
  const status = (formData.get('status') as string) || "PUBLISHED"
  
  const material = (formData.get('material') as string) || null
  const color = (formData.get('color') as string) || null
  const dimensions = (formData.get('dimensions') as string) || null
  
  const featuresStr = formData.get('features') as string
  let features: string[] | undefined = undefined
  if (featuresStr) {
    try { features = JSON.parse(featuresStr) } catch(e) {}
  }

  const whatsInTheBoxStr = formData.get('whatsInTheBox') as string
  let whatsInTheBox: string[] | undefined = undefined
  if (whatsInTheBoxStr) {
    try { whatsInTheBox = JSON.parse(whatsInTheBoxStr) } catch(e) {}
  }

  const specsStr = formData.get('specs') as string
  let specs = undefined
  if (specsStr) {
    try { specs = JSON.parse(specsStr) } catch(e) {}
  }

  const existingImagesStr = formData.get('existingImages') as string
  let imageUrls: string[] = []
  if (existingImagesStr) {
    try { imageUrls = JSON.parse(existingImagesStr) } catch(e) {}
  }

  const images = formData.getAll('images') as File[]
  for (const image of images) {
    if (image && image.size > 0) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        throw new Error(`Invalid file type: ${image.type}. Only JPEG, PNG, WebP, GIF, and AVIF are allowed.`)
      }
      if (image.size > MAX_FILE_SIZE) {
        throw new Error(`File too large: ${(image.size / 1024 / 1024).toFixed(1)}MB. Maximum 10MB allowed.`)
      }
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64String = `data:${image.type};base64,${buffer.toString('base64')}`

      try {
        const uploadResponse = await cloudinary.uploader.upload(base64String, {
          folder: "sri-sai-products"
        })
        imageUrls.push(uploadResponse.secure_url)
      } catch (error) {
        console.error("Cloudinary upload error:", error)
      }
    }
  }
  
  let dataToUpdate: any = {
    name,
    storeId,
    categoryId,
    brand,
    price,
    description,
    inStock,
    isFeatured,
    stockQuantity: inStock ? 1 : 0,
    status,
    imageUrls,
    material,
    color,
    dimensions
  }
  
  if (legacyDescription !== null) dataToUpdate.legacyDescription = legacyDescription;
  if (features !== undefined) dataToUpdate.features = features;
  if (whatsInTheBox !== undefined) dataToUpdate.whatsInTheBox = whatsInTheBox;
  if (specs !== undefined) dataToUpdate.specs = specs;

  await prisma.product.update({
    where: { id },
    data: dataToUpdate
  })

  revalidatePath("/admin/products")
}

export async function toggleProductStock(id: string, currentInStock: boolean) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  await prisma.product.update({
    where: { id },
    data: { inStock: !currentInStock }
  })
  revalidatePath("/admin/products")
}

export async function toggleProductFeatured(id: string, currentIsFeatured: boolean) {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  await prisma.product.update({
    where: { id },
    data: { 
      isFeatured: !currentIsFeatured,
      featuredAt: !currentIsFeatured ? new Date() : null
    }
  })
  revalidatePath("/admin/products")
}
