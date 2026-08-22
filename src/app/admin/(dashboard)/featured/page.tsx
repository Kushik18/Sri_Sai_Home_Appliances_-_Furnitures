import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import FeaturedClient from "./FeaturedClient"

export default async function FeaturedProductsPage() {
  const featuredProducts = await prisma.product.findMany({
    where: { isFeatured: true },
    orderBy: { featuredOrder: 'asc' },
    select: {
      id: true, 
      name: true, 
      imageUrls: true, 
      brand: true, 
      category: { select: { name: true } }, 
      store: { select: { name: true } },
      inStock: true, 
      status: true,
      isFeatured: true
    }
  })
  
  const allProducts = await prisma.product.findMany({
    where: { isFeatured: false },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, 
      name: true, 
      imageUrls: true, 
      category: { select: { name: true } },
      store: { select: { name: true } }
    }
  })

  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Loading...</div>}>
      <FeaturedClient 
        initialFeatured={featuredProducts} 
        availableProducts={allProducts}
      />
    </Suspense>
  )
}
