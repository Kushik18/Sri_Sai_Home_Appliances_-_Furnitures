"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ExternalLink, Search, ArrowUp, ArrowDown, Trash2, Plus, Loader2 } from "lucide-react"

export type ProductSubset = {
  id: string
  name: string
  imageUrls: string[]
  brand?: string | null
  category: { name: string } | null
  store: { name: string } | null
  inStock?: boolean
  status?: string
}

type CuratedProductListProps = {
  title: string
  description: string
  type: "featured" | "bestseller"
  maxItems: number
  storefrontTotal: number // Total items shown on storefront (used to calculate fallback slots)
  initialCurated: ProductSubset[]
  availableProducts: ProductSubset[]
  onAdd: (id: string, newLength: number) => Promise<void>
  onRemove: (id: string) => Promise<void>
  onReorder: (ids: string[]) => Promise<void>
}

export default function CuratedProductList({
  title,
  description,
  type,
  maxItems,
  storefrontTotal,
  initialCurated,
  availableProducts,
  onAdd,
  onRemove,
  onReorder,
}: CuratedProductListProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("store") === "Furniture" ? "Furniture" : "Appliances"

  const [curated, setCurated] = useState(initialCurated)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)

  // Isolate current store's data
  const activeCurated = useMemo(() => 
    curated.filter(p => p.store?.name === activeTab),
  [curated, activeTab])

  const storeAvailable = useMemo(() => 
    availableProducts.filter(p => p.store?.name === activeTab),
  [availableProducts, activeTab])

  const filteredAvailable = useMemo(() => {
    if (!searchQuery.trim()) return storeAvailable
    const lowerQuery = searchQuery.toLowerCase()
    return storeAvailable.filter(p => 
      p.name.toLowerCase().includes(lowerQuery)
    )
  }, [storeAvailable, searchQuery])

  const handleTabChange = (tab: string) => {
    router.push(`?store=${tab}`)
    setSearchQuery("") // Reset search when switching tabs
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === activeCurated.length - 1) return

    const newActiveCurated = [...activeCurated]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    // Swap within the active store slice
    const temp = newActiveCurated[index]
    newActiveCurated[index] = newActiveCurated[swapIndex]
    newActiveCurated[swapIndex] = temp
    
    // Update global state by replacing the active store's slice
    const newCurated = curated.map(p => {
      if (p.store?.name !== activeTab) return p
      // Find the new position in our reordered array
      const newPos = newActiveCurated.findIndex(ap => ap.id === p.id)
      return newActiveCurated[newPos]
    })
    
    setCurated(newCurated)
    
    // Save only the active store's ordered IDs to DB
    setIsSaving(true)
    try {
      await onReorder(newActiveCurated.map(p => p.id))
    } catch (e) {
      console.error(`Failed to reorder ${type}`)
      setCurated(curated) // Revert
    } finally {
      setIsSaving(false)
    }
  }

  const handleAdd = async (product: ProductSubset) => {
    if (activeCurated.length >= maxItems) return
    
    setLoadingId(product.id)
    try {
      await onAdd(product.id, activeCurated.length)
      setCurated([...curated, product])
      setIsDialogOpen(false)
      setSearchQuery("")
    } catch (e) {
      console.error(`Failed to add ${type} product`)
    } finally {
      setLoadingId(null)
    }
  }

  const handleRemove = async (id: string) => {
    setLoadingId(id)
    try {
      await onRemove(id)
      const newCurated = curated.filter(p => p.id !== id)
      setCurated(newCurated)
      
      // Auto re-sync order for the active store
      const remainingActive = newCurated.filter(p => p.store?.name === activeTab)
      await onReorder(remainingActive.map(p => p.id))
    } catch (e) {
      console.error(`Failed to remove ${type} product`)
    } finally {
      setLoadingId(null)
    }
  }

  const remainingSlots = Math.max(0, storefrontTotal - activeCurated.length);
  const fallbackProducts = storeAvailable.slice(0, remainingSlots);

  const renderFallbackTable = () => {
    if (fallbackProducts.length === 0) return null;
    return (
      <div className="mt-8 border-t border-slate-200 dark:border-slate-800 pt-6 bg-slate-50/50 dark:bg-slate-950/40 -mx-4 md:-mx-6 px-4 md:px-6 rounded-b-lg pb-6">
        <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-2">
          <span className="bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] px-2 py-0.5 rounded font-bold">FALLBACK</span>
          Currently Showing
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Automatically filling empty slots with latest {activeTab.toLowerCase()}</p>
        
        {/* Desktop Fallback */}
        <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden opacity-75">
          <Table>
            <TableBody>
              {fallbackProducts.map((product, index) => (
                <TableRow key={product.id} className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800/60">
                  <TableCell className="w-[80px]">
                    <span className="text-xs font-mono text-slate-400 dark:text-slate-500 pl-4">{activeCurated.length + index + 1}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                        {product.imageUrls?.[0] && (
                          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover grayscale opacity-70" />
                        )}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{product.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-slate-500 dark:text-slate-400">{product.category?.name || '-'}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="secondary" 
                      size="sm"
                      disabled={loadingId === product.id}
                      onClick={() => handleAdd(product)}
                      className="text-xs"
                    >
                      {loadingId === product.id ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
                      Add
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Mobile Fallback */}
        <div className="md:hidden space-y-3 opacity-75">
          {fallbackProducts.map((product, index) => (
            <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col gap-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="text-xs font-mono text-slate-400 dark:text-slate-500 pt-1 font-bold">{activeCurated.length + index + 1}.</div>
                <div className="w-16 h-16 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                  {product.imageUrls?.[0] && (
                    <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover grayscale opacity-70" />
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-2 leading-tight">{product.name}</div>
                  <div className="mt-1">
                    <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded truncate max-w-full">
                      {product.category?.name || 'Uncategorized'}
                    </span>
                  </div>
                </div>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                className="w-full h-11"
                disabled={loadingId === product.id}
                onClick={() => handleAdd(product)}
              >
                {loadingId === product.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                Add to {type}
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{description}</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link href={`/${activeTab.toLowerCase()}`} target="_blank">
            <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 h-11 sm:h-9 border-slate-200 dark:border-slate-800">
              <ExternalLink className="w-4 h-4" /> <span className="hidden sm:inline">Preview {activeTab}</span><span className="sm:hidden">Preview</span>
            </Button>
          </Link>
          
          <Button 
            disabled={activeCurated.length >= maxItems} 
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white h-11 sm:h-9"
            onClick={() => setIsDialogOpen(true)}
          >
            <Plus className="w-4 h-4" /> Add Item
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="sm:max-w-[500px] w-[calc(100%-2rem)] max-w-lg rounded-xl max-h-[90vh] flex flex-col p-4 sm:p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <DialogHeader>
                <DialogTitle className="text-slate-900 dark:text-white">Add to {title} ({activeTab})</DialogTitle>
                <p className="text-sm text-slate-500 dark:text-slate-400">Search by product name. You can curate up to {maxItems} items per store.</p>
              </DialogHeader>
              
              <div className="relative mt-4">
                <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input 
                  placeholder={`Search ${activeTab.toLowerCase()}...`} 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
              
              <div className="mt-4 flex-1 overflow-y-auto space-y-2 border border-slate-200 dark:border-slate-800 rounded-xl p-2 bg-slate-50/50 dark:bg-slate-950/40">
                {filteredAvailable.length === 0 ? (
                  <p className="text-center text-sm text-slate-500 dark:text-slate-400 py-8">No unselected {activeTab.toLowerCase()} found.</p>
                ) : (
                  filteredAvailable.map(product => (
                    <div key={product.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs gap-3">
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="w-12 h-12 sm:w-10 sm:h-10 rounded overflow-hidden bg-slate-100 dark:bg-slate-800 flex-shrink-0 border border-slate-200 dark:border-slate-700">
                          {product.imageUrls?.[0] ? (
                            <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-slate-200 dark:bg-slate-800" />
                          )}
                        </div>
                        <div className="flex flex-col flex-1 min-w-0">
                          <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{product.name}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{product.category?.name || "Uncategorized"}</span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        disabled={loadingId === product.id}
                        onClick={() => handleAdd(product)}
                        className="w-full sm:w-auto h-10 sm:h-8"
                      >
                        {loadingId === product.id ? <Loader2 className="w-4 h-4 animate-spin sm:mr-0 mr-2" /> : <Plus className="w-4 h-4 sm:mr-0 mr-2 sm:hidden" />}
                        <span className="sm:hidden">Add to List</span>
                        <span className="hidden sm:inline">{loadingId === product.id ? "" : "Add"}</span>
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xs border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Tabs Header */}
        <div className="flex border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => handleTabChange("Appliances")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === "Appliances"
                ? "border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-slate-50/50 dark:bg-slate-950/40"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            Appliances
          </button>
          <button
            onClick={() => handleTabChange("Furniture")}
            className={`flex-1 py-4 text-sm font-semibold transition-colors ${
              activeTab === "Furniture"
                ? "border-b-2 border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400 bg-slate-50/50 dark:bg-slate-950/40"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
            }`}
          >
            Furniture
          </button>
        </div>

        <div className="p-4 md:p-6 relative">
          {isSaving && (
            <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 backdrop-blur-[1px] z-10 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600 dark:text-blue-400" />
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{activeTab} Lineup</h2>
            <span className={`text-sm font-bold px-2.5 py-1 rounded-full w-max ${activeCurated.length >= maxItems ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
              <span className="hidden sm:inline">{activeCurated.length} / {maxItems} Selected</span>
              <span className="sm:hidden">{activeCurated.length}/{maxItems}</span>
            </span>
          </div>
          
          {activeCurated.length === 0 ? (
            <div className="space-y-6">
              <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">No manually curated {activeTab.toLowerCase()}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-4">
                  Because this list is empty, your homepage is currently falling back to showing these newest products below. 
                </p>
                <Button onClick={() => setIsDialogOpen(true)} variant="outline" className="border-slate-200 dark:border-slate-800">
                  Browse {activeTab}
                </Button>
              </div>

              {renderFallbackTable()}
            </div>
          ) : (
            <div>
              {/* Desktop Table */}
              <div className="hidden md:block border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
                    <TableRow className="border-b border-slate-200 dark:border-slate-800">
                      <TableHead className="w-[80px] text-slate-700 dark:text-slate-300">Order</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300">Product</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300">Category</TableHead>
                      <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
                      <TableHead className="text-right text-slate-700 dark:text-slate-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeCurated.map((product, index) => (
                      <TableRow key={product.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                        <TableCell>
                          <div className="flex flex-col gap-1 items-center justify-center w-8">
                            <button 
                              onClick={() => handleMove(index, 'up')}
                              disabled={index === 0}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                            >
                              <ArrowUp className="w-4 h-4" />
                            </button>
                            <span className="text-xs font-bold font-mono text-slate-900 dark:text-slate-100">{index + 1}</span>
                            <button 
                              onClick={() => handleMove(index, 'down')}
                              disabled={index === activeCurated.length - 1}
                              className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300"
                            >
                              <ArrowDown className="w-4 h-4" />
                            </button>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                              {product.imageUrls?.[0] && (
                                <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div>
                              <div className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{product.name}</div>
                              {product.brand && <div className="text-xs text-slate-500 dark:text-slate-400">{product.brand}</div>}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm text-slate-600 dark:text-slate-300">{product.category?.name || '-'}</span>
                        </TableCell>
                        <TableCell>
                          {product.status === 'PUBLISHED' ? (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-green-100 dark:bg-green-950/70 text-green-800 dark:text-green-300 uppercase">Published</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 uppercase">Draft</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleRemove(product.id)}
                            disabled={loadingId === product.id}
                            className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                            title="Remove from List"
                          >
                            {loadingId === product.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {activeCurated.map((product, index) => (
                  <div key={product.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex flex-col gap-3 shadow-2xs">
                    <div className="flex items-start gap-3">
                      <div className="flex flex-col gap-1 items-center justify-center w-10 flex-shrink-0 bg-slate-50 dark:bg-slate-800 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                        <button 
                          onClick={() => handleMove(index, 'up')}
                          disabled={index === 0}
                          className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 hover:text-slate-900"
                        >
                          <ArrowUp className="w-5 h-5" />
                        </button>
                        <span className="text-sm font-bold font-mono text-slate-900 dark:text-slate-100">{index + 1}</span>
                        <button 
                          onClick={() => handleMove(index, 'down')}
                          disabled={index === activeCurated.length - 1}
                          className="p-1 rounded disabled:opacity-30 disabled:cursor-not-allowed text-slate-600 dark:text-slate-300 hover:text-slate-900"
                        >
                          <ArrowDown className="w-5 h-5" />
                        </button>
                      </div>
                      
                      <div className="w-16 h-16 rounded border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 overflow-hidden flex-shrink-0">
                        {product.imageUrls?.[0] && (
                          <img src={product.imageUrls[0]} alt={product.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex flex-col pt-1">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm line-clamp-2 leading-tight">{product.name}</div>
                        {product.brand && <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{product.brand}</div>}
                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="inline-block bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] px-1.5 py-0.5 rounded truncate max-w-full">
                            {product.category?.name || 'Uncategorized'}
                          </span>
                          {product.status === 'PUBLISHED' ? (
                            <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-green-100 dark:bg-green-950/70 text-green-800 dark:text-green-300 uppercase">PUB</span>
                          ) : (
                            <span className="inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 uppercase">DRF</span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={() => handleRemove(product.id)}
                      disabled={loadingId === product.id}
                      className="w-full h-11 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40"
                    >
                      {loadingId === product.id ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
                      Remove from {title}
                    </Button>
                  </div>
                ))}
              </div>

              {renderFallbackTable()}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
