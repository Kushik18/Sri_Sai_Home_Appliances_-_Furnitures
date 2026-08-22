import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import BestSellersClient from "./BestSellersClient"

export const dynamic = 'force-dynamic'

export default async function BestSellersPage() {
  const bestSellers = await prisma.product.findMany({
    where: { isBestSeller: true },
    orderBy: { bestSellerOrder: 'asc' },
    select: { 
      id: true, 
      name: true, 
      imageUrls: true, 
      brand: true, 
      category: { select: { name: true } }, 
      store: { select: { name: true } },
      inStock: true, 
      status: true,
    }
  })
  
  const allProducts = await prisma.product.findMany({
    where: { isBestSeller: false },
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
      <BestSellersClient 
        initialCurated={bestSellers} 
        availableProducts={allProducts}
      />
    </Suspense>
  )
}
