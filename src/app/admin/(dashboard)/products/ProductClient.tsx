"use client"

import { useState, useMemo, useCallback, memo } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus, Image as ImageIcon, UploadCloud, Edit2, ArrowUpDown } from "lucide-react"
import { deleteProduct, toggleProductStock } from "./actions"
import { BulkUploadModal } from "./BulkUploadModal"
import { ProductFormDialog } from "./ProductFormDialog"

type Store = { id: string; name: string }
type Category = { id: string; name: string; storeId: string | null }
type Product = {
  id: string
  name: string
  brand: string | null
  price: number | null
  inStock: boolean
  store: Store | null
  category: Category | null
  imageUrls: string[]
  status: string
  description: string | null
  legacyDescription: string | null
  features: string[]
  whatsInTheBox: string[]
  specs?: any
  material?: string | null
  color?: string | null
  dimensions?: string | null
}

// ─── Memoised row so only changed rows re-render on stock toggle ──────────────
const ProductRow = memo(function ProductRow({
  product,
  onEdit,
  onDelete,
}: {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
}) {
  return (
    <TableRow className={`border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 ${product.status === 'DRAFT' ? 'bg-amber-50/20 dark:bg-amber-950/20' : ''}`}>
      <TableCell>
        {product.imageUrls[0] ? (
          <img src={product.imageUrls[0]} alt={product.name} className="w-10 h-10 object-cover rounded-md border border-slate-200 dark:border-slate-800" />
        ) : (
          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 flex items-center justify-center rounded-md border border-slate-200 dark:border-slate-700">
            <ImageIcon className="w-4 h-4 text-slate-400" />
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="font-semibold text-slate-900 dark:text-slate-100">{product.name}</div>
        <div className="text-xs text-slate-500 dark:text-slate-400">{product.brand}</div>
      </TableCell>
      <TableCell>
        <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
          {product.store?.name || 'No Store'}
        </span>
        <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">{product.category?.name || 'No Category'}</span>
      </TableCell>
      <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{product.price ? `₹${product.price}` : '-'}</TableCell>
      <TableCell>
        <div className="flex flex-col space-y-1 items-start">
          {product.status === 'DRAFT' ? (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 uppercase">Needs Review</span>
          ) : (
            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-green-100 dark:bg-green-950/70 text-green-800 dark:text-green-300 uppercase">Published</span>
          )}
          <Select
            value={product.inStock ? "true" : "false"}
            onValueChange={(val) => {
              if ((val === "true") !== product.inStock) toggleProductStock(product.id, product.inStock)
            }}
          >
            <SelectTrigger className={`h-6 text-[10px] font-bold px-2 py-0 border transition uppercase w-fit gap-1 ${product.inStock ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/50 text-green-700 dark:text-green-300' : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300'}`}>
              <span className="truncate">{product.inStock ? "IN STOCK" : "OUT OF STOCK"}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true" className="text-xs font-bold text-green-700 dark:text-green-300">IN STOCK</SelectItem>
              <SelectItem value="false" className="text-xs font-bold text-red-700 dark:text-red-300">OUT OF STOCK</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" onClick={() => onEdit(product)} className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 mr-2">
          <Edit2 className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => onDelete(product.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50">
          <Trash2 className="w-4 h-4" />
        </Button>
      </TableCell>
    </TableRow>
  )
})

// ─── Memoised mobile card ─────────────────────────────────────────────────────
const ProductCard = memo(function ProductCard({
  product,
  onEdit,
  onDelete,
}: {
  product: Product
  onEdit: (p: Product) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className={`flex flex-col p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs ${product.status === 'DRAFT' ? 'bg-amber-50/20 dark:bg-amber-950/20' : ''}`}>
      <div className="flex gap-4">
        <div className="w-20 h-20 rounded-md bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden">
          {product.imageUrls[0] ? (
            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-6 h-6 text-slate-400" />
          )}
        </div>
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 truncate">{product.name}</h3>
          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.brand}</span>
          <div className="mt-1 flex flex-wrap gap-1">
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">{product.store?.name || 'No Store'}</span>
            <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600">{product.category?.name || 'No Category'}</span>
          </div>
          <div className="mt-2 font-medium text-sm text-gray-900">{product.price ? `₹${product.price}` : 'Price not set'}</div>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
        <div className="flex gap-2">
          {product.status === 'DRAFT' ? (
            <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold bg-amber-100 text-amber-800 uppercase">Needs Review</span>
          ) : (
            <span className="inline-flex items-center rounded-md px-2 py-1 text-[10px] font-bold bg-green-100 text-green-800 uppercase">Published</span>
          )}
          <Select
            value={product.inStock ? "true" : "false"}
            onValueChange={(val) => {
              if ((val === "true") !== product.inStock) toggleProductStock(product.id, product.inStock)
            }}
          >
            <SelectTrigger className={`h-6 text-[10px] font-bold px-2 py-0 border transition uppercase w-fit gap-1 ${product.inStock ? 'border-green-200 bg-green-50 text-green-700' : 'border-red-200 bg-red-50 text-red-700'}`}>
              <span className="truncate">{product.inStock ? "IN STOCK" : "OUT OF STOCK"}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="true" className="text-xs font-bold text-green-700">IN STOCK</SelectItem>
              <SelectItem value="false" className="text-xs font-bold text-red-700">OUT OF STOCK</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <Button variant="outline" className="flex-1 text-blue-600 border-blue-200 hover:bg-blue-50" onClick={() => onEdit(product)}>
          <Edit2 className="w-4 h-4 mr-2" /> Edit
        </Button>
        <Button variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50" onClick={() => onDelete(product.id)}>
          <Trash2 className="w-4 h-4 mr-2" /> Delete
        </Button>
      </div>
    </div>
  )
})

// ─── Main client component ────────────────────────────────────────────────────
export default function ProductClient({
  products,
  stores,
  categories,
}: {
  products: Product[]
  stores: Store[]
  categories: Category[]
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL")
  const [storeFilter, setStoreFilter] = useState<string>("ALL")
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL")
  const [brandFilter, setBrandFilter] = useState<string>("ALL")
  const [sortKey, setSortKey] = useState<"name_asc" | "name_desc" | "price_asc" | "price_desc" | "stock_in" | "stock_out" | "category_asc" | "category_desc">("name_asc")

  // Memoised derivations — recompute only when products / storeFilter change
  const allBrands = useMemo(
    () => Array.from(new Set(products.map(p => p.brand).filter((b): b is string => !!b))).sort(),
    [products]
  )

  // Categories scoped to the selected store (so the dropdown stays relevant)
  const availableCategories = useMemo(() => {
    const seen = new Map<string, string>()
    for (const p of products) {
      if (!p.category) continue
      if (storeFilter !== "ALL" && p.store?.id !== storeFilter) continue
      seen.set(p.category.id, p.category.name)
    }
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name))
  }, [products, storeFilter])

  // Brands scoped to the selected store + category
  const availableBrands = useMemo(() => {
    const brands = new Set<string>()
    for (const p of products) {
      if (!p.brand) continue
      if (storeFilter !== "ALL" && p.store?.id !== storeFilter) continue
      if (categoryFilter !== "ALL" && p.category?.id !== categoryFilter) continue
      brands.add(p.brand)
    }
    return Array.from(brands).sort()
  }, [products, storeFilter, categoryFilter])

  const filteredProducts = useMemo(() => {
    const filtered = products.filter(p => {
      const statusMatch = filter === "ALL" || p.status === filter
      const storeMatch = storeFilter === "ALL" || p.store?.id === storeFilter
      const categoryMatch = categoryFilter === "ALL" || p.category?.id === categoryFilter
      const brandMatch = brandFilter === "ALL" || p.brand === brandFilter
      return statusMatch && storeMatch && categoryMatch && brandMatch
    })
    return [...filtered].sort((a, b) => {
      switch (sortKey) {
        case "name_asc":     return a.name.localeCompare(b.name)
        case "name_desc":    return b.name.localeCompare(a.name)
        case "price_asc":    return (a.price ?? 0) - (b.price ?? 0)
        case "price_desc":   return (b.price ?? 0) - (a.price ?? 0)
        case "stock_in":     return (b.inStock ? 1 : 0) - (a.inStock ? 1 : 0)
        case "stock_out":    return (a.inStock ? 1 : 0) - (b.inStock ? 1 : 0)
        case "category_asc":  return (a.category?.name ?? "").localeCompare(b.category?.name ?? "")
        case "category_desc": return (b.category?.name ?? "").localeCompare(a.category?.name ?? "")
        default: return 0
      }
    })
  }, [products, filter, storeFilter, categoryFilter, brandFilter, sortKey])

  const isFiltered = filter !== "ALL" || storeFilter !== "ALL" || categoryFilter !== "ALL" || brandFilter !== "ALL"

  const productNames = useMemo(() => products.map(p => p.name), [products])

  // Stable callbacks — don't recreate on every render
  const openCreate = useCallback(() => {
    setEditingProduct(null)
    setIsDialogOpen(true)
  }, [])

  const openEdit = useCallback((product: Product) => {
    setEditingProduct(product)
    setIsDialogOpen(true)
  }, [])

  const handleDelete = useCallback(async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try { await deleteProduct(id) } catch { alert("Failed to delete product") }
    }
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Products</h1>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Button variant="outline" onClick={() => setIsBulkOpen(true)} className="w-full sm:w-auto">
            <UploadCloud className="w-4 h-4 mr-2" /> Upload Stock Sheet
          </Button>
          <Button onClick={openCreate} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex overflow-x-auto space-x-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl w-full sm:w-fit scrollbar-hide shrink-0">
          {(["ALL", "PUBLISHED", "DRAFT"] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`whitespace-nowrap px-4 py-1.5 text-sm font-semibold rounded-lg transition ${filter === f ? 'bg-white dark:bg-slate-900 shadow-2xs text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}`}
            >
              {f === "ALL" ? "All Products" : f === "PUBLISHED" ? "Published" : "Needs Review"}
            </button>
          ))}
        </div>

        {/* Active filter count badge */}
        {isFiltered && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-blue-100 dark:bg-blue-950/60 px-2.5 py-0.5 text-xs font-semibold text-blue-700 dark:text-blue-300">
              {filteredProducts.length} result{filteredProducts.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={() => { setFilter("ALL"); setStoreFilter("ALL"); setCategoryFilter("ALL"); setBrandFilter("ALL") }}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 underline underline-offset-2 transition"
            >
              Clear all
            </button>
          </div>
        )}
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          {/* Sort */}
          <Select value={sortKey} onValueChange={(val) => setSortKey(val as typeof sortKey)}>
            <SelectTrigger className="w-full sm:w-[190px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <ArrowUpDown className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              <span className="truncate">
                {sortKey === "name_asc" ? "Name A → Z"
                  : sortKey === "name_desc" ? "Name Z → A"
                  : sortKey === "stock_in" ? "In Stock First"
                  : sortKey === "stock_out" ? "Out of Stock First"
                  : sortKey === "category_asc" ? "Category A → Z"
                  : "Category Z → A"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name_asc">Name A → Z</SelectItem>
              <SelectItem value="name_desc">Name Z → A</SelectItem>
              <SelectItem value="category_asc">Category A → Z</SelectItem>
              <SelectItem value="category_desc">Category Z → A</SelectItem>

              <SelectItem value="stock_in">In Stock First</SelectItem>
              <SelectItem value="stock_out">Out of Stock First</SelectItem>
            </SelectContent>
          </Select>

          {/* Store filter */}
          <Select
            value={storeFilter}
            onValueChange={(val: string | null) => {
              if (!val) return
              setStoreFilter(val)
              setCategoryFilter("ALL")
              setBrandFilter("ALL")
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="truncate">{storeFilter === "ALL" ? "All Stores" : stores.find(s => s.id === storeFilter)?.name || "Filter by Store"}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Stores</SelectItem>
              {stores.map(store => <SelectItem key={store.id} value={store.id}>{store.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Category filter */}
          <Select
            value={categoryFilter}
            onValueChange={(val: string | null) => {
              if (!val) return
              setCategoryFilter(val)
              setBrandFilter("ALL")
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="truncate">
                {categoryFilter === "ALL" ? "All Categories" : availableCategories.find(c => c.id === categoryFilter)?.name || "Filter by Category"}
              </span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Categories</SelectItem>
              {availableCategories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
            </SelectContent>
          </Select>

          {/* Brand filter */}
          <Select value={brandFilter} onValueChange={(val: string | null) => val && setBrandFilter(val)}>
            <SelectTrigger className="w-full sm:w-[160px] bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <span className="truncate">{brandFilter === "ALL" ? "All Brands" : brandFilter}</span>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Brands</SelectItem>
              {availableBrands.map(brand => <SelectItem key={brand} value={brand}>{brand}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Desktop table */}
      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hidden md:block shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="w-16 text-slate-700 dark:text-slate-300">Image</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Name</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Store / Category</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Price</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Status & Stock</TableHead>
              <TableHead className="text-right text-slate-700 dark:text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-slate-500 dark:text-slate-400">No products found.</TableCell>
              </TableRow>
            ) : (
              filteredProducts.map((product) => (
                <ProductRow key={product.id} product={product} onEdit={openEdit} onDelete={handleDelete} />
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            No products found.
          </div>
        ) : (
          filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} onEdit={openEdit} onDelete={handleDelete} />
          ))
        )}
      </div>

      {/* Form dialog — mounted separately so table never re-renders for dialog state */}
      <ProductFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        editingProduct={editingProduct}
        stores={stores}
        categories={categories}
        allBrands={allBrands}
      />

      <BulkUploadModal open={isBulkOpen} onOpenChange={setIsBulkOpen} existingProductNames={productNames} />
    </div>
  )
}
