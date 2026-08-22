import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import ProductDetailClient from "./ProductDetailClient"

// Cache and re-generate product pages at most every 5 minutes
export const revalidate = 300

export default async function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params

  // Fetch product first, then fire related query in parallel once we have categoryId
  const product = await prisma.product.findUnique({
    where: { id: resolvedParams.id, status: 'PUBLISHED' },
    select: {
      id: true,
      name: true,
      brand: true,
      description: true,
      legacyDescription: true,
      features: true,
      whatsInTheBox: true,
      inStock: true,
      imageUrls: true,
      specs: true,
      material: true,
      color: true,
      dimensions: true,
      categoryId: true,
      category: { select: { name: true } },
      store: { select: { name: true } }
    }
  })

  if (!product) {
    notFound()
  }

  // Related products — runs after product fetch so we have categoryId
  const relatedProducts = await prisma.product.findMany({
    where: { 
      categoryId: product.categoryId, 
      id: { not: product.id },
      status: 'PUBLISHED'
    },
    take: 4,
    select: {
      id: true,
      name: true,
      brand: true,
      imageUrls: true,
      inStock: true
    }
  })

  return <ProductDetailClient product={product as any} relatedProducts={relatedProducts} />
}

