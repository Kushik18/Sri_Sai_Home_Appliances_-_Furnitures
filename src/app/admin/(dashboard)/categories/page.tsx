import { getCategories, getStores } from "./actions"
import CategoryClient from "./CategoryClient"
import { prisma } from "@/lib/prisma"

export default async function CategoriesPage() {
  // Ensure default stores exist
  const existingStores = await getStores()
  if (existingStores.length === 0) {
    await prisma.store.createMany({
      data: [
        { name: "Appliances" },
        { name: "Furniture" }
      ]
    })
  }

  const categories = await getCategories()
  const stores = await getStores()

  return (
    <CategoryClient categories={categories} stores={stores} />
  )
}
