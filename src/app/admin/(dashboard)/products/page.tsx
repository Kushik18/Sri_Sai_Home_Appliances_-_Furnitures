import { getProducts } from "./actions"
import { getCategories, getStores } from "../categories/actions"
import ProductClient from "./ProductClient"

export default async function ProductsPage() {
  const products = await getProducts()
  const stores = await getStores()
  const categories = await getCategories()

  return (
    <ProductClient 
      products={products} 
      stores={stores} 
      categories={categories} 
    />
  )
}
