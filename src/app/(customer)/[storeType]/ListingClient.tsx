"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import Link from "next/link"
import { useStore } from "@/components/StoreProvider"
import { Search, Filter, X, ArrowLeft, ArrowDownUp, LayoutGrid, List as ListIcon, MessageCircle, RotateCcw } from "lucide-react"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import { FurnitureFilterSidebar } from "@/components/FurnitureFilterSidebar"

type Product = { 
  id: string, 
  name: string, 
  inStock: boolean, 
  imageUrls: string[], 
  brand: string, 
  categoryId: string,
  price: number | null,
  isFeatured?: boolean,
  isBestSeller?: boolean,
  specs?: any,
  description?: string | null,
  legacyDescription?: string | null
}
type Category = { id: string, name: string }

function extractKeySpecs(specs: any): { label: string, value: string }[] {
  if (!specs || typeof specs !== 'object') return []
  
  const extracted: { label: string, value: string }[] = []
  
  if (specs._version === "2") {
    for (const [category, attributes] of Object.entries(specs)) {
      if (category === "_version" || category === "What's in the box") continue
      if (typeof attributes === 'object' && attributes !== null) {
        for (const [key, value] of Object.entries(attributes)) {
          if (value && String(value).trim() !== '') {
            extracted.push({ label: key, value: String(value) })
            if (extracted.length >= 3) return extracted
          }
        }
      }
    }
  } else {
    for (const [key, value] of Object.entries(specs)) {
      if (key === "Box Contents" || key === "Included Components") continue
      if (value && String(value).trim() !== '') {
        extracted.push({ label: key, value: String(value) })
        if (extracted.length >= 3) return extracted
      }
    }
  }
  
  return extracted
}

function stripHtml(html: string | null | undefined): string {
  if (!html) return "";
  return html.replace(/<[^>]*>?/gm, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&');
}

function CustomSelect({
  id,
  value,
  onChange,
  options,
  placeholder = "Select...",
  align = "left"
}: {
  id?: string,
  value: string,
  onChange: (val: string) => void,
  options: { value: string, label: string }[],
  placeholder?: string,
  align?: "left" | "right"
}) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const selectedOption = options.find(opt => opt.value === value)

  return (
    <div className="relative w-full sm:w-auto flex-shrink-0 min-w-0" ref={selectRef}>
      <button
        type="button"
        id={id}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full sm:w-auto flex items-center justify-between gap-2 rounded-xl text-sm pl-3.5 pr-3 py-2 border transition-all shadow-2xs ${
          isOpen || value
            ? "border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 text-blue-950 dark:text-blue-100 font-medium"
            : "border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <svg className={`w-4 h-4 text-gray-500 dark:text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>

      {isOpen && (
        <div className={`absolute z-[100] mt-1.5 max-h-64 min-w-[200px] w-max max-w-[90vw] sm:max-w-xs ${align === "right" ? "right-0" : "left-0"} overflow-y-auto rounded-xl bg-white dark:bg-slate-900 shadow-2xl ring-1 ring-black/10 border border-slate-200 dark:border-slate-700 focus:outline-none py-1.5 transition-all`}>
          <ul className="py-0.5">
            {options.map((option) => (
              <li
                key={option.value}
                className={`text-sm cursor-pointer select-none py-2.5 pl-3.5 pr-4 flex items-center justify-between gap-3 transition-colors ${
                  value === option.value 
                    ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 font-semibold' 
                    : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
              >
                <span className="truncate">{option.label}</span>
                {value === option.value && (
                  <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 flex-shrink-0" />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

export default function ListingClient({ 
  products, 
  categories,
  storeType
}: { 
  products: Product[]
  categories: Category[]
  storeType: "appliances" | "furniture"
}) {
  const { setActiveStore } = useStore()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  const categoryParam = searchParams.get("category")
  const roomParam = searchParams.get("room")

  const urlSearch = searchParams.get("search")
  const [searchQuery, setSearchQuery] = useState(urlSearch || "")

  useEffect(() => {
    setSearchQuery(urlSearch || "")
  }, [urlSearch])

  // Sync sidebar search query back to the URL
  useEffect(() => {
    const timer = setTimeout(() => {
      const currentUrlSearch = searchParams.get("search") || ""
      if (searchQuery !== currentUrlSearch) {
        const params = new URLSearchParams(searchParams.toString())
        if (searchQuery) {
          params.set("search", searchQuery)
        } else {
          params.delete("search")
        }
        router.replace(`${pathname}?${params.toString()}`, { scroll: false })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery, searchParams, pathname, router])
  const [mounted, setMounted] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>("grid")

  useEffect(() => {
    setMounted(true)
    const savedMode = localStorage.getItem('productViewMode')
    if (savedMode === 'grid' || savedMode === 'list') {
      setViewMode(savedMode)
    }
  }, [])

  const activeViewMode = mounted ? viewMode : "grid"

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    setViewMode(mode)
    localStorage.setItem('productViewMode', mode)
  }

  const openFilterSection = (sectionId: string) => {
    setIsMobileFiltersOpen(true)
    setTimeout(() => {
      const el = document.getElementById(sectionId)
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' })
        el.focus({ preventScroll: true })
      }
    }, 100)
  }

  // Sync the context with the URL (so if they land directly on /furniture, the header tabs update)
  useEffect(() => {
    setActiveStore(storeType)
  }, [storeType, setActiveStore])

  // Sync selected category from URL
  useEffect(() => {
    if (categoryParam) {
      const cat = categories.find(c => c.name.toLowerCase() === categoryParam.toLowerCase())
      if (cat) {
        setSelectedCategory(cat.id)
      }
    } else {
      setSelectedCategory(null)
    }
  }, [categoryParam, categories])

  // Helper to update URL when category is selected
  const handleCategorySelect = (categoryId: string | null) => {
    setSelectedCategory(categoryId)
    
    const params = new URLSearchParams(searchParams.toString())
    if (categoryId) {
      const cat = categories.find(c => c.id === categoryId)
      if (cat) {
        params.set("category", cat.name)
      }
    } else {
      params.delete("category")
    }
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("sort", value)
    } else {
      params.delete("sort")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentSort = searchParams.get("sort") || ""

  const handleBrandChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value) {
      params.set("brand", value)
    } else {
      params.delete("brand")
    }
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  const currentBrand = searchParams.get("brand") || ""

  const uniqueBrands = useMemo(() => {
    const brands = products.map(p => p.brand).filter(Boolean)
    return Array.from(new Set(brands)).sort((a, b) => a.localeCompare(b))
  }, [products])

  const filteredProducts = useMemo(() => {
    const rawQuery = searchQuery.trim().toLowerCase()
    const searchTerms = rawQuery ? rawQuery.split(/\s+/).filter(Boolean) : []

    let result = products.filter(p => {
      const categoryName = categories.find(c => c.id === p.categoryId)?.name || ""
      const descText = (stripHtml(p.description || "") + " " + stripHtml(p.legacyDescription || "")).toLowerCase()
      const nameText = p.name.toLowerCase()
      const brandText = (p.brand || "").toLowerCase()
      const catText = categoryName.toLowerCase()

      let matchesSearch = true
      if (searchTerms.length > 0) {
        matchesSearch = searchTerms.every(term => {
          const inName = nameText.includes(term)
          const inBrand = brandText.includes(term)
          const inCategory = catText.includes(term)
          const inDesc = descText.includes(term)

          let inAlias = false
          if ((term === "fridge" || term === "refrigerator") && (catText.includes("refrigerator") || nameText.includes("fridge") || nameText.includes("refrigerator"))) inAlias = true
          if ((term === "tv" || term === "television") && (catText.includes("television") || nameText.includes("tv") || nameText.includes("television"))) inAlias = true
          if ((term === "ac" || term === "air conditioner") && (catText.includes("air conditioner") || nameText.includes("ac") || nameText.includes("cooler"))) inAlias = true
          if ((term === "cot" || term === "bed") && (catText.includes("bed") || nameText.includes("cot"))) inAlias = true

          return inName || inBrand || inCategory || inDesc || inAlias
        })
      }
      
      let matchesCategory = true
      
      if (selectedCategory) {
        matchesCategory = p.categoryId === selectedCategory
      } else if (roomParam) {
        let roomGroups = []
        if (storeType === "appliances") {
          roomGroups = [
            { name: "Kitchen", items: ["Chimneys", "Geysers", "Induction/Stoves", "Mixers/Grinders", "Pressure Cookers", "Refrigerators", "Water Purifiers", "Dishwashers"] },
            { name: "Laundry Room", items: ["Washing Machines"] },
            { name: "Living Room", items: ["Televisions", "Fans", "Coolers", "Air Coolers"] },
            { name: "Bedroom", items: ["Air Conditioners", "Laptops", "Mobiles", "Others"] }
          ]
        } else {
          roomGroups = [
            { name: "Living Room", items: ["Sofas", "Chairs"] },
            { name: "Bedroom", items: ["Beds/Cots", "Wardrobes", "Mattresses"] },
            { name: "Dining Room", items: ["Dining Tables", "Chairs"] },
            { name: "Study/Office", items: ["Chairs"] } // Add more specific ones if needed
          ]
        }
        
        const room = roomGroups.find(g => g.name.toLowerCase() === roomParam.toLowerCase())
        if (room) {
          const categoryForProduct = categories.find(c => c.id === p.categoryId)
          if (categoryForProduct) {
            matchesCategory = room.items.some(itemName => 
              categoryForProduct.name.toLowerCase() === itemName.toLowerCase() || 
              (itemName === "Coolers" && categoryForProduct.name.toLowerCase() === "air coolers") ||
              (itemName === "Beds/Cots" && categoryForProduct.name.toLowerCase().includes("bed")) ||
              (itemName === "Sofas" && categoryForProduct.name.toLowerCase().includes("sofa"))
            )
            
            // If room is Bedroom (Appliances), it should also include unmapped categories as "Others"
            if (!matchesCategory && room.name === "Bedroom" && storeType === "appliances") {
              const allMappedNames = [
                "Chimneys", "Geysers", "Induction/Stoves", "Mixers/Grinders", "Pressure Cookers", "Refrigerators", "Water Purifiers", "Dishwashers",
                "Washing Machines", "Televisions", "Fans", "Coolers", "Air Coolers", "Air Conditioners", "Laptops", "Mobiles", "Others"
              ].map(n => n.toLowerCase());
              
              if (!allMappedNames.includes(categoryForProduct.name.toLowerCase())) {
                matchesCategory = true;
              }
            }
          } else {
            matchesCategory = false
          }
        }
      }

      let matchesBrand = true
      if (currentBrand) {
        matchesBrand = p.brand.toLowerCase() === currentBrand.toLowerCase()
      }

      return matchesSearch && matchesCategory && matchesBrand
    })

    const nameAsc = (a: Product, b: Product) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
    const nameDesc = (a: Product, b: Product) => b.name.localeCompare(a.name, 'en', { sensitivity: 'base' })

    if (currentSort === "" || currentSort === "name_asc") {
      result = [...result].sort(nameAsc)
    } else if (currentSort === "brand_asc") {
      result = [...result].sort((a, b) => {
        const brandCompare = (a.brand || "").localeCompare(b.brand || "", 'en', { sensitivity: 'base' })
        return brandCompare !== 0 ? brandCompare : nameAsc(a, b)
      })
    } else if (currentSort === "name_desc") {
      result = [...result].sort(nameDesc)
    } else if (currentSort === "brand_desc") {
      result = [...result].sort((a, b) => {
        const brandCompare = (b.brand || "").localeCompare(a.brand || "", 'en', { sensitivity: 'base' })
        return brandCompare !== 0 ? brandCompare : nameDesc(a, b)
      })
    } else if (currentSort === "newest") {
      // Original order / DB return order
    }

    return result
  }, [products, searchQuery, selectedCategory, roomParam, categories, storeType, currentSort, currentBrand])

  const activeFilters = useMemo(() => {
    const list: { key: string; label: string; clear: () => void }[] = []
    
    if (searchQuery) {
      list.push({
        key: "search",
        label: `Search: "${searchQuery}"`,
        clear: () => setSearchQuery("")
      })
    }
    if (selectedCategory) {
      const cat = categories.find(c => c.id === selectedCategory)
      list.push({
        key: "category",
        label: `Category: ${cat?.name || "Selected"}`,
        clear: () => handleCategorySelect(null)
      })
    }
    if (roomParam) {
      list.push({
        key: "room",
        label: `Room: ${roomParam}`,
        clear: () => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete("room")
          router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
      })
    }
    if (currentBrand) {
      list.push({
        key: "brand",
        label: `Brand: ${currentBrand}`,
        clear: () => handleBrandChange("")
      })
    }
    const mat = searchParams.get("material")
    if (mat) {
      list.push({
        key: "material",
        label: `Material: ${mat}`,
        clear: () => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete("material")
          router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
      })
    }
    const col = searchParams.get("color")
    if (col) {
      list.push({
        key: "color",
        label: `Color: ${col}`,
        clear: () => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete("color")
          router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
      })
    }
    if (searchParams.get("inStock") === "true") {
      list.push({
        key: "inStock",
        label: `In Stock`,
        clear: () => {
          const params = new URLSearchParams(searchParams.toString())
          params.delete("inStock")
          router.push(`${pathname}?${params.toString()}`, { scroll: false })
        }
      })
    }

    return list
  }, [searchQuery, selectedCategory, categories, roomParam, currentBrand, searchParams, pathname, router])

  const handleClearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory(null)
    router.push(pathname, { scroll: false })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-4">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Home
        </Link>
      </div>
      <div className="flex justify-between items-end mb-4 border-b dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight capitalize text-slate-900 dark:text-slate-100">{storeType}</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Showing {filteredProducts.length} products</p>
        </div>
        {activeFilters.length > 0 && (
          <button
            onClick={handleClearAllFilters}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Clear All Filters ({activeFilters.length})
          </button>
        )}
      </div>

      {/* Mobile Quick Filter Chips & Search */}
      <div className="md:hidden flex flex-wrap items-center gap-2 pb-4 mb-4 -mt-2">
        <button 
          className={`flex-shrink-0 flex items-center ${activeFilters.length > 0 ? "bg-blue-600 text-white font-semibold" : "bg-gray-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium"} px-4 py-2 rounded-full text-sm transition-colors`}
          onClick={() => setIsMobileFiltersOpen(true)}
        >
          <Filter className="w-4 h-4 mr-1.5" /> Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
        </button>
        <div className="relative flex-grow min-w-[140px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search products..."
            className="w-full bg-white dark:bg-slate-900 border border-gray-300 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-full pl-9 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {activeFilters.length > 0 && (
          <button 
            onClick={handleClearAllFilters}
            className="flex-shrink-0 flex items-center bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800/60 px-3 py-2 rounded-full font-semibold text-xs transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Clear All
          </button>
        )}
      </div>

      {/* Active Filter Chips Bar */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200/80 dark:border-slate-800">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mr-1">
            Active Filters ({activeFilters.length}):
          </span>
          {activeFilters.map(filter => (
            <span
              key={filter.key}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs"
            >
              {filter.label}
              <button
                onClick={filter.clear}
                className="hover:text-red-500 text-slate-400 dark:text-slate-400 transition-colors"
                title={`Remove ${filter.label}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
          <button
            onClick={handleClearAllFilters}
            className="ml-auto text-xs font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline flex items-center gap-1 px-2 py-1 rounded-md transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            Clear All
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className={`
          ${isMobileFiltersOpen ? "fixed inset-0 z-50 bg-white dark:bg-slate-950 p-6 overflow-y-auto" : "hidden md:block w-64 flex-shrink-0"}
        `}>
          <div className="flex justify-between items-center md:hidden mb-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">Filters</h2>
            <button onClick={() => setIsMobileFiltersOpen(false)} className="text-slate-900 dark:text-slate-100"><X className="w-6 h-6" /></button>
          </div>

          {storeType === "furniture" ? (
            <FurnitureFilterSidebar 
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              categories={categories}
              selectedCategory={selectedCategory}
              handleCategorySelect={handleCategorySelect}
              handleClearAllFilters={handleClearAllFilters}
              hasActiveFilters={activeFilters.length > 0}
            />
          ) : (
            <div className="space-y-8">
              {activeFilters.length > 0 && (
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
                <h3 className="font-semibold mb-4 flex items-center text-slate-900 dark:text-slate-100"><Search className="w-4 h-4 mr-2" /> Search</h3>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full border dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <div id="categories-section">
                <h3 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Categories</h3>
                
                <div className="space-y-4">
                  <button 
                    className={`block w-full text-left px-2 py-1.5 rounded text-sm ${selectedCategory === null ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900"}`}
                    onClick={() => handleCategorySelect(null)}
                  >
                    All Categories
                  </button>
                  
                  {[
                    { name: "Kitchen", items: ["Chimneys", "Geysers", "Induction/Stoves", "Mixers/Grinders", "Pressure Cookers", "Refrigerators", "Water Purifiers", "Dishwashers"] },
                    { name: "Laundry Room", items: ["Washing Machines"] },
                    { name: "Living Room", items: ["Televisions", "Fans", "Coolers", "Air Coolers"] },
                    { name: "Bedroom", items: ["Air Conditioners", "Laptops", "Mobiles", "Others"] }
                  ].map(group => {
                    const groupCats = group.items
                      .map(itemName => categories.find(c => c.name.toLowerCase() === itemName.toLowerCase() || (itemName === "Coolers" && c.name.toLowerCase() === "air coolers")))
                      .filter(Boolean) as Category[];
                      
                    // Also find any unmapped categories and put them in Bedroom -> Others if we are rendering Bedroom
                    const isBedroom = group.name === "Bedroom";
                    let unmappedCats: Category[] = [];
                    if (isBedroom) {
                      const allMappedNames = [
                        "Chimneys", "Geysers", "Induction/Stoves", "Mixers/Grinders", "Pressure Cookers", "Refrigerators", "Water Purifiers", "Dishwashers",
                        "Washing Machines", "Televisions", "Fans", "Coolers", "Air Coolers", "Air Conditioners", "Laptops", "Mobiles", "Others"
                      ].map(n => n.toLowerCase());
                      unmappedCats = categories.filter(c => !allMappedNames.includes(c.name.toLowerCase()));
                    }
                    
                    const combinedCats = [...groupCats, ...unmappedCats];
                    
                    if (combinedCats.length === 0) return null;

                    return (
                      <div key={group.name} className="space-y-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 pl-2 mt-4">{group.name}</h4>
                        {combinedCats.map(cat => (
                          <button 
                            key={cat.id}
                            className={`block w-full text-left px-2 py-1.5 rounded text-sm flex items-center ${selectedCategory === cat.id ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 font-medium" : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-900"}`}
                            onClick={() => handleCategorySelect(cat.id)}
                          >
                            <span className="text-gray-400 dark:text-gray-600 mr-2 text-lg leading-none">&bull;</span>
                            {cat.name}
                          </button>
                        ))}
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </aside>

        {/* Product Grid */}
        <main className="flex-1">
          {/* Top Bar for Sorting (Only for Furniture for now, or both) */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-500 dark:text-gray-400 hidden md:block">
              {filteredProducts.length} {filteredProducts.length === 1 ? "Product" : "Products"} Found
            </p>
            <div className="flex w-full sm:w-auto items-center sm:ml-auto gap-3 sm:gap-4">
              <div className="flex-1 sm:flex-none flex items-center min-w-0">
                <label htmlFor="brand-filter" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3 hidden sm:flex items-center">
                  Brand:
                </label>
                <CustomSelect 
                  id="brand-filter" 
                  value={currentBrand}
                  onChange={handleBrandChange}
                  align="left"
                  options={[
                    { value: "", label: "All Brands" },
                    ...uniqueBrands.map(brand => ({ value: brand, label: brand }))
                  ]}
                  placeholder="All Brands"
                />
              </div>
              <div className="flex-1 sm:flex-none flex items-center min-w-0">
                <label htmlFor="sort" className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-3 hidden sm:flex items-center">
                  <ArrowDownUp className="w-4 h-4 mr-1.5" /> Sort by:
                </label>
                <CustomSelect 
                  id="sort" 
                  value={currentSort}
                  onChange={handleSortChange}
                  align="right"
                  options={[
                    { value: "", label: "Name (A-Z)" },
                    { value: "name_desc", label: "Name (Z-A)" },
                    { value: "newest", label: "Newest Arrivals" }
                  ]}
                  placeholder="Name (A-Z)"
                />
              </div>
              
              {/* View Toggle */}
              <div className="hidden sm:flex items-center border border-gray-300 dark:border-slate-700 rounded-md overflow-hidden bg-white dark:bg-slate-900 ml-2">
                <button 
                  onClick={() => handleViewModeChange('grid')}
                  className={`p-2 ${activeViewMode === 'grid' ? 'bg-gray-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleViewModeChange('list')}
                  className={`p-2 border-l border-gray-300 dark:border-slate-700 ${activeViewMode === 'list' ? 'bg-gray-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                  aria-label="List view"
                >
                  <ListIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 dark:bg-slate-900/50 rounded-xl border-2 border-dashed dark:border-slate-800">
              <p className="text-gray-500 dark:text-gray-400">No products found matching your filters.</p>
              <button 
                onClick={() => { setSearchQuery(""); handleCategorySelect(null) }}
                className="mt-4 text-blue-600 dark:text-blue-400 font-medium hover:underline"
              >
                Clear all filters
              </button>
            </div>
          ) : (
            <div className={activeViewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6" : "flex flex-col gap-6"}>
              {filteredProducts.map(product => (
                <Link key={product.id} href={`/product/${product.id}`} className="group block">
                  {activeViewMode === 'grid' ? (
                    <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col h-full">
                      <div className="w-full aspect-[4/3] sm:aspect-square bg-white relative overflow-hidden flex items-center justify-center p-3 sm:p-6 border-b dark:border-slate-800">
                        {product.imageUrls[0] ? (
                          <img src={product.imageUrls[0]} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition duration-300" />
                        ) : (
                          <span className="text-gray-400 font-medium text-xs sm:text-sm">No Image</span>
                        )}
                        {(product.isBestSeller || product.isFeatured) && (
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {product.isBestSeller && <span className="bg-amber-500 text-white text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-sm">Best Seller</span>}
                            {product.isFeatured && !product.isBestSeller && <span className="bg-blue-600 text-white text-[9px] sm:text-xs font-bold px-2 py-0.5 rounded shadow-sm">Featured</span>}
                          </div>
                        )}
                      </div>
                      <div className="p-3 sm:p-5 flex flex-col flex-grow">
                        {product.brand && (
                          <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">{product.brand}</span>
                        )}
                        <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 line-clamp-2 uppercase text-xs sm:text-base flex-grow">{product.name}</h3>
                        <div className="flex items-center justify-between mt-auto pt-3 border-t dark:border-slate-800">
                          <span className={`px-2 py-0.5 sm:px-2.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold ${product.inStock ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </span>
                          <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 sm:px-3.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium">
                            View
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-row h-[220px] md:h-[260px] lg:h-[280px]">
                      <div className="w-36 sm:w-48 md:w-64 lg:w-72 flex-shrink-0 bg-white relative overflow-hidden flex items-center justify-center p-4 sm:p-6 border-r dark:border-slate-800 self-stretch">
                        {product.imageUrls[0] ? (
                          <img src={product.imageUrls[0]} alt={product.name} className="object-contain max-w-full max-h-full mix-blend-multiply group-hover:scale-105 transition duration-300" />
                        ) : (
                          <span className="text-gray-400 font-medium text-xs sm:text-sm">No Image</span>
                        )}
                        {(product.isBestSeller || product.isFeatured) && (
                          <div className="absolute top-2 left-2 flex flex-col gap-1">
                            {product.isBestSeller && <span className="bg-amber-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded shadow-sm">Best Seller</span>}
                            {product.isFeatured && !product.isBestSeller && <span className="bg-blue-600 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded shadow-sm">Featured</span>}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-4 sm:p-5 md:p-6 lg:p-8 flex flex-col justify-between flex-grow overflow-hidden relative">
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <span className="text-[10px] sm:text-xs font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase">{product.brand}</span>
                            <span className="text-[10px] sm:text-xs text-gray-400 dark:text-gray-500 hidden md:inline">&bull;</span>
                            <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded-full hidden md:inline">{categories.find(c => c.id === product.categoryId)?.name || "Uncategorized"}</span>
                          </div>
                          
                          <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-2 md:line-clamp-none text-sm sm:text-base md:text-xl md:leading-snug pr-4">{product.name}</h3>
                          
                          <div className="hidden md:block mb-4 space-y-2">
                            <div className="flex items-center text-sm">
                               <span className={`font-semibold ${product.inStock ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                                 {product.inStock ? "✓ In Stock" : "✗ Out of Stock"}
                               </span>
                            </div>
                            
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-3 line-clamp-2 overflow-hidden text-ellipsis">
                              {stripHtml(product.description || product.legacyDescription) || "No description available."}
                            </p>
                          </div>

                          <div className="flex md:hidden items-center gap-3 mt-1 sm:mt-2">
                            <span className={`px-2 py-0.5 sm:py-1 rounded text-[10px] sm:text-xs font-bold ${product.inStock ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                              {product.inStock ? "In Stock" : "Out of Stock"}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-3 md:pt-6 border-t dark:border-slate-800/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">
                            Price on Enquiry
                          </div>
                          
                          <div className="flex items-center gap-2 md:gap-3 w-full md:w-auto">
                            <button className="flex-1 md:flex-none text-center bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-slate-100 px-3 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-colors">
                              View Details
                            </button>
                            <button 
                              onClick={(e) => {
                                e.preventDefault()
                                e.stopPropagation()
                                window.open(`https://wa.me/919148600888?text=${encodeURIComponent(`Hi, I'd like to enquire about ${product.name}.`)}`, '_blank')
                              }}
                              className="flex-1 md:flex-none flex items-center justify-center gap-1.5 md:gap-2 bg-[#25D366] hover:bg-[#20bd59] text-white px-3 md:px-6 py-2 md:py-2.5 rounded-lg text-xs md:text-sm font-semibold transition-colors"
                            >
                              <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4" />
                              <span className="hidden md:inline">Enquire Now</span>
                              <span className="md:hidden">Enquire</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
