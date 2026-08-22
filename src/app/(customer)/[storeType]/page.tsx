import { prisma } from "@/lib/prisma"
import ListingClient from "./ListingClient"
import { notFound } from "next/navigation"
import { Suspense } from "react"

// Refresh listing pages every 2 minutes at most
export const revalidate = 120

export default async function ListingPage(
  props: { 
    params: Promise<{ storeType: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }
) {
  const resolvedParams = await props.params
  const resolvedSearchParams = await props.searchParams
  const storeType = resolvedParams.storeType.toLowerCase()

  if (storeType !== "appliances" && storeType !== "furniture") {
    notFound()
  }

  const storeName = storeType === "appliances" ? "Appliances" : "Furniture"

  // Process search params
  const categoryParam = typeof resolvedSearchParams.category === 'string' ? resolvedSearchParams.category : undefined
  const minPrice = typeof resolvedSearchParams.minPrice === 'string' ? parseFloat(resolvedSearchParams.minPrice) : undefined
  const maxPrice = typeof resolvedSearchParams.maxPrice === 'string' ? parseFloat(resolvedSearchParams.maxPrice) : undefined
  const material = typeof resolvedSearchParams.material === 'string' ? resolvedSearchParams.material : undefined
  const color = typeof resolvedSearchParams.color === 'string' ? resolvedSearchParams.color : undefined
  const inStock = resolvedSearchParams.inStock === 'true'
  const sort = typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : 'newest'

  let categoryId: string | undefined = undefined
  if (categoryParam) {
    const cat = await prisma.category.findFirst({
      where: { name: { equals: categoryParam, mode: 'insensitive' }, store: { name: storeName } },
      select: { id: true }
    })
    if (cat) categoryId = cat.id
  }

  const whereClause: any = {
    store: { name: storeName },
    status: 'PUBLISHED'
  }

  if (categoryId) whereClause.categoryId = categoryId
  if (minPrice !== undefined || maxPrice !== undefined) {
    whereClause.price = {}
    if (minPrice !== undefined && !isNaN(minPrice)) whereClause.price.gte = minPrice
    if (maxPrice !== undefined && !isNaN(maxPrice)) whereClause.price.lte = maxPrice
  }
  if (material) whereClause.material = { equals: material, mode: 'insensitive' }
  if (color) whereClause.color = { equals: color, mode: 'insensitive' }
  if (inStock) whereClause.inStock = true

  let orderBy: any = { createdAt: 'desc' }
  if (sort === 'price_asc') orderBy = { price: 'asc' }
  else if (sort === 'price_desc') orderBy = { price: 'desc' }

  // Run products + categories queries in parallel — cuts wait time ~50%
  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where: whereClause,
      orderBy: orderBy,
      select: {
        id: true,
        name: true,
        inStock: true,
        imageUrls: true,
        brand: true,
        price: true,
        categoryId: true,
        isFeatured: true,
        isBestSeller: true,
        description: true,
        legacyDescription: true,
      }
    }),
    prisma.category.findMany({
      where: { store: { name: storeName } },
      orderBy: { name: 'asc' },
      select: { id: true, name: true }
    })
  ])

  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-8">Loading...</div>}>
      <ListingClient 
        products={products as any[]}
        categories={categories}
        storeType={storeType as "appliances" | "furniture"}
      />
    </Suspense>
  )
}

