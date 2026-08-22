import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, Filter, X, RotateCcw } from "lucide-react"
import { useState } from "react"

export function FurnitureFilterSidebar({
  searchQuery,
  setSearchQuery,
  categories,
  selectedCategory,
  handleCategorySelect,
  handleClearAllFilters,
  hasActiveFilters
}: {
  searchQuery: string
  setSearchQuery: (val: string) => void
  categories: { id: string, name: string }[]
  selectedCategory: string | null
  handleCategorySelect: (id: string | null) => void
  handleClearAllFilters?: () => void
  hasActiveFilters?: boolean
}) {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const material = searchParams.get("material") || ""
  const color = searchParams.get("color") || ""
  const inStock = searchParams.get("inStock") === "true"

  const updateParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-8">
      {hasActiveFilters && handleClearAllFilters && (
        <div className="pb-3 border-b dark:border-slate-800 flex justify-between items-center">
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Filters Applied</span>
          <button
            onClick={handleClearAllFilters}
            className="text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline flex items-center gap-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All
          </button>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-4 flex items-center dark:text-slate-100"><Search className="w-4 h-4 mr-2" /> Search</h3>
        <input 
          type="text" 
          placeholder="Search products..." 
          className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div>
        <h3 className="font-semibold mb-4">Categories</h3>
        <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
          <button 
            className={`block w-full text-left px-2 py-1.5 rounded text-sm ${selectedCategory === null ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
            onClick={() => handleCategorySelect(null)}
          >
            All Furniture
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              className={`block w-full text-left px-2 py-1.5 rounded text-sm flex items-center ${selectedCategory === cat.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-600 hover:bg-gray-50"}`}
              onClick={() => handleCategorySelect(cat.id)}
            >
              <span className="text-gray-400 mr-2 text-lg leading-none">&bull;</span>
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Material</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {['Solid Wood', 'Engineered Wood', 'Fabric', 'Leather', 'Metal', 'Glass'].map(m => (
            <label key={m} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                name="material"
                checked={material === m}
                onChange={() => updateParam("material", m)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{m}</span>
            </label>
          ))}
          <label className="flex items-center space-x-2 cursor-pointer mt-2 pt-2 border-t border-dashed">
            <input 
              type="radio" 
              name="material"
              checked={!material}
              onChange={() => updateParam("material", null)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500 italic">Any Material</span>
          </label>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="font-semibold mb-4">Color</h3>
        <div className="space-y-2 max-h-40 overflow-y-auto">
          {['Walnut', 'Teak', 'Mahogany', 'Beige', 'Black', 'White', 'Grey', 'Blue'].map(c => (
            <label key={c} className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="radio" 
                name="color"
                checked={color === c}
                onChange={() => updateParam("color", c)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{c}</span>
            </label>
          ))}
          <label className="flex items-center space-x-2 cursor-pointer mt-2 pt-2 border-t border-dashed">
            <input 
              type="radio" 
              name="color"
              checked={!color}
              onChange={() => updateParam("color", null)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="text-sm text-gray-500 italic">Any Color</span>
          </label>
        </div>
      </div>

      <div className="border-t pt-6">
        <label className="flex items-center space-x-2 cursor-pointer">
          <input 
            type="checkbox" 
            checked={inStock}
            onChange={(e) => updateParam("inStock", e.target.checked ? "true" : null)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
          />
          <span className="text-sm font-medium text-gray-900">In Stock Only</span>
        </label>
      </div>

      <button 
        onClick={() => router.push(pathname)}
        className="w-full text-sm text-red-600 hover:text-red-700 hover:underline mt-4"
      >
        Clear all filters
      </button>
    </div>
  )
}
