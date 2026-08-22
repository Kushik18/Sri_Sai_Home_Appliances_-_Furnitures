"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

type BulkItem = {
  name: string
  quantity?: number
  brand?: string
  category?: string
  store?: string
}

type ProcessResult = {
  matched: number
  created: number
  skipped: number
  errors: string[]
}

export async function processBulkUpload(items: BulkItem[]): Promise<ProcessResult> {
  const session = await getServerSession(authOptions)
  if (!session) throw new Error("Unauthorized")

  const result: ProcessResult = { matched: 0, created: 0, skipped: 0, errors: [] }

  if (!items || items.length === 0) {
    return result
  }

  // Fetch existing catalogs for matching
  const existingProducts = await prisma.product.findMany({ select: { id: true, name: true, stockQuantity: true } })
  const existingCategories = await prisma.category.findMany({ include: { store: true } })
  const existingStores = await prisma.store.findMany()

  // Store & Category caching for quick lookup
  const storeMap = new Map(existingStores.map(s => [s.name, s.id]))
  const categoryMap = new Map(existingCategories.map(c => [`${c.store?.name || 'No Store'}-${c.name}`, c.id]))

  for (const item of items) {
    if (!item.name || item.name.trim() === '') {
      result.skipped++
      continue
    }

    const cleanName = item.name.trim()
    const cleanNameLower = cleanName.toLowerCase()

    // 1. Try to match existing product
    const existing = existingProducts.find(p => p.name.toLowerCase() === cleanNameLower)

    if (existing) {
      // Mode 2: Update stock quantity
      if (item.quantity !== undefined) {
        try {
          await prisma.product.update({
            where: { id: existing.id },
            data: { 
              stockQuantity: item.quantity,
              inStock: item.quantity > 0
            }
          })
          result.matched++
        } catch (e) {
          result.errors.push(`Failed to update ${cleanName}`)
          result.skipped++
        }
      } else {
        // Matched but no quantity to update
        result.matched++
      }
    } else {
      // Mode 1: Create New Product
      try {
        let storeId = null;
        let categoryId = null;

        if (item.store && item.category) {
          // Get or create store
          if (storeMap.has(item.store)) {
            storeId = storeMap.get(item.store);
          } else {
            const newStore = await prisma.store.create({ data: { name: item.store } });
            storeId = newStore.id;
            storeMap.set(item.store, storeId);
          }

          // Get or create category
          const catKey = `${item.store}-${item.category}`;
          if (categoryMap.has(catKey)) {
            categoryId = categoryMap.get(catKey);
          } else {
            const newCategory = await prisma.category.create({
              data: { name: item.category, storeId: storeId! }
            });
            categoryId = newCategory.id;
            categoryMap.set(catKey, categoryId);
          }
        }

        // Create as PUBLISHED
        await prisma.product.create({
          data: {
            name: cleanName,
            brand: item.brand || "",
            categoryId: categoryId,
            storeId: storeId,
            stockQuantity: item.quantity !== undefined ? item.quantity : 1,
            inStock: item.quantity !== undefined ? item.quantity > 0 : true,
            status: "PUBLISHED", // Published directly!
            imageUrls: [],
            price: null
          }
        })
        result.created++
      } catch (e) {
        result.errors.push(`Failed to create ${cleanName}`)
        result.skipped++
      }
    }
  }

  revalidatePath("/admin/products")
  return result
}
