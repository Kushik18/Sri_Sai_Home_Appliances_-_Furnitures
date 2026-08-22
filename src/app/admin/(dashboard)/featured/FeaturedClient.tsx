"use client"

import CuratedProductList, { ProductSubset } from "@/components/admin/CuratedProductList"
import { addFeaturedProduct, removeFeaturedProduct, reorderFeaturedProducts } from "./actions"

export default function FeaturedClient({ 
  initialFeatured, 
  availableProducts 
}: { 
  initialFeatured: ProductSubset[], 
  availableProducts: ProductSubset[] 
}) {
  return (
    <CuratedProductList
      title="Featured Arrivals"
      description="Manage the exact products and order shown on the customer homepage."
      type="featured"
      maxItems={6}
      storefrontTotal={7}
      initialCurated={initialFeatured}
      availableProducts={availableProducts}
      onAdd={addFeaturedProduct}
      onRemove={removeFeaturedProduct}
      onReorder={reorderFeaturedProducts}
    />
  )
}
