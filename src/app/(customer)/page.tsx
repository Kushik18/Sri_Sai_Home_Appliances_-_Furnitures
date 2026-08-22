import { prisma } from "@/lib/prisma"
import HomeClient from "./HomeClient"

const commonSelect = {
  id: true, name: true, inStock: true, imageUrls: true, brand: true, categoryId: true, store: true, category: true
}

export default async function HomePage() {
  // Appliances
  const featuredAppliances = await prisma.product.findMany({
    where: { status: 'PUBLISHED', store: { name: 'Appliances' } },
    take: 7,
    orderBy: [{ isFeatured: 'desc' }, { featuredOrder: 'asc' }, { createdAt: 'desc' }],
    select: commonSelect
  })

  const bestSellerAppliances = await prisma.product.findMany({
    where: { status: 'PUBLISHED', store: { name: 'Appliances' } },
    take: 4,
    orderBy: [{ isBestSeller: 'desc' }, { bestSellerOrder: 'asc' }, { createdAt: 'desc' }],
    select: commonSelect
  })

  const newLaunchAppliances = await prisma.product.findMany({
    where: { status: 'PUBLISHED', store: { name: 'Appliances' } },
    take: 4,
    orderBy: { createdAt: 'desc' },
    select: commonSelect
  })

  // Furniture
  const featuredFurniture = await prisma.product.findMany({
    where: { status: 'PUBLISHED', store: { name: 'Furniture' } },
    take: 7,
    orderBy: [{ isFeatured: 'desc' }, { featuredOrder: 'asc' }, { createdAt: 'desc' }],
    select: commonSelect
  })

  const bestSellerFurniture = await prisma.product.findMany({
    where: { status: 'PUBLISHED', store: { name: 'Furniture' } },
    take: 4,
    orderBy: [{ isBestSeller: 'desc' }, { bestSellerOrder: 'asc' }, { createdAt: 'desc' }],
    select: commonSelect
  })

  const newLaunchFurniture = await prisma.product.findMany({
    where: { status: 'PUBLISHED', store: { name: 'Furniture' } },
    take: 4,
    orderBy: { createdAt: 'desc' },
    select: commonSelect
  })

  // Categories
  const categories = await prisma.category.findMany({
    include: { store: true }
  })

  // Hero Images
  const heroImages = await prisma.heroImage.findMany({
    orderBy: { order: 'asc' }
  })

  // Brand Logos
  const brandLogos = await prisma.brandLogo.findMany({
    orderBy: { order: 'asc' }
  })
  
  const applianceCategories = categories.filter(c => c.store?.name === "Appliances")
  const furnitureCategories = categories.filter(c => c.store?.name === "Furniture")

  return (
    <HomeClient 
      featuredAppliances={featuredAppliances as any}
      bestSellerAppliances={bestSellerAppliances as any}
      newLaunchAppliances={newLaunchAppliances as any}
      featuredFurniture={featuredFurniture as any}
      bestSellerFurniture={bestSellerFurniture as any}
      newLaunchFurniture={newLaunchFurniture as any}
      applianceCategories={applianceCategories}
      furnitureCategories={furnitureCategories}
      heroImages={heroImages}
      brandLogos={brandLogos}
    />
  )
}
