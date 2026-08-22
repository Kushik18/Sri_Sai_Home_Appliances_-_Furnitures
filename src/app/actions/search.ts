"use server"

import { prisma } from "@/lib/prisma"

export async function getSearchSuggestions(query: string, storeType: string) {
  if (!query || query.trim() === "") return []

  // Ensure query is alphanumeric to avoid regex syntax errors in raw query
  const normalizedQuery = query.trim().replace(/[^a-zA-Z0-9\s]/g, '')
  if (!normalizedQuery) return []

  const storeName = storeType === "appliances" ? "Appliances" : "Furniture"

  try {
    const searchTerm = `%${normalizedQuery}%`
    const startsWithTerm = `${normalizedQuery}%`

    const products = await prisma.$queryRaw<
      { id: string; name: string; imageUrls: string[] }[]
    >`
      SELECT p.id, p.name, p."imageUrls"
      FROM "Product" p
      JOIN "Store" s ON p."storeId" = s.id
      LEFT JOIN "Category" c ON p."categoryId" = c.id
      WHERE s.name = ${storeName}
        AND p.status = 'PUBLISHED'
        AND (
          p.name ILIKE ${searchTerm}
          OR p.brand ILIKE ${searchTerm}
          OR c.name ILIKE ${searchTerm}
          OR p.description ILIKE ${searchTerm}
        )
      ORDER BY
        CASE
          WHEN p.name ILIKE ${startsWithTerm} THEN 1
          WHEN p.brand ILIKE ${startsWithTerm} THEN 2
          WHEN c.name ILIKE ${startsWithTerm} THEN 3
          ELSE 4
        END ASC,
        p."isFeatured" DESC,
        p.name ASC
      LIMIT 8
    `
    
    console.log(`[Search] query: "${query}", normalized: "${normalizedQuery}", store: "${storeName}", matches: ${products.length}`)

    return products.map(product => ({
      id: product.id,
      name: product.name,
      thumbnailUrl: product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null
    }))
  } catch (error) {
    console.error("Search suggestion error:", error)
    return []
  }
}
