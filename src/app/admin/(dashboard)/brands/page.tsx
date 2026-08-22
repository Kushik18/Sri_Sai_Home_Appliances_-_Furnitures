import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import BrandClient from "./BrandClient"

export const dynamic = "force-dynamic"

export default async function BrandsAdminPage() {
  const logos = await prisma.brandLogo.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <Suspense fallback={<div className="text-slate-500">Loading...</div>}>
        <BrandClient initialLogos={logos} />
      </Suspense>
    </div>
  )
}
