import { Suspense } from "react"
import { prisma } from "@/lib/prisma"
import HeroClient from "./HeroClient"

export default async function HeroPage() {
  const heroImages = await prisma.heroImage.findMany({
    orderBy: { order: 'asc' }
  })

  return (
    <Suspense fallback={<div className="p-6 text-slate-500">Loading...</div>}>
      <HeroClient initialImages={heroImages} />
    </Suspense>
  )
}
