"use client"

import CuratedProductList, { ProductSubset } from "@/components/admin/CuratedProductList"
import { addBestSeller, removeBestSeller, reorderBestSellers } from "./actions"

export default function BestSellersClient({ 
  initialCurated, 
  availableProducts 
}: { 
  initialCurated: ProductSubset[], 
  availableProducts: ProductSubset[] 
}) {
  return (
    <CuratedProductList
      title="Best Sellers"
      description="Manage the exact products and order shown in the Best Sellers section on the homepage."
      type="bestseller"
      maxItems={4}
      storefrontTotal={4}
      initialCurated={initialCurated}
      availableProducts={availableProducts}
      onAdd={addBestSeller}
      onRemove={removeBestSeller}
      onReorder={reorderBestSellers}
    />
  )
}
