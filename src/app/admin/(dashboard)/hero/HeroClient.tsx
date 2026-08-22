"use client"

import { useState, useMemo, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { UploadCloud, Trash2, ArrowUp, ArrowDown, Loader2, Image as ImageIcon } from "lucide-react"
import { uploadHeroImage, deleteHeroImage, reorderHeroImages } from "./actions"
import { HeroImage } from "@prisma/client"

export default function HeroClient({ initialImages }: { initialImages: HeroImage[] }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("store") === "Furniture" ? "Furniture" : "Appliances"

  const [images, setImages] = useState(initialImages)
  const [isUploading, setIsUploading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const activeImages = useMemo(() => 
    images.filter(img => img.store === activeTab).sort((a, b) => a.order - b.order),
  [images, activeTab])

  const handleTabChange = (tab: string) => {
    router.push(`?store=${tab}`)
  }

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    
    setIsUploading(true)
    const formData = new FormData()
    formData.append("image", file)
    
    try {
      await uploadHeroImage(activeTab, formData)
      router.refresh()
      setTimeout(() => setIsUploading(false), 1000)
    } catch (error) {
      console.error(error)
      alert("Failed to upload image")
      setIsUploading(false)
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hero image?")) return
    setDeletingId(id)
    try {
      await deleteHeroImage(id)
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Failed to delete image")
    }
    setDeletingId(null)
  }

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return
    if (direction === 'down' && index === activeImages.length - 1) return

    const newActiveImages = [...activeImages]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    
    const temp = newActiveImages[index]
    newActiveImages[index] = newActiveImages[swapIndex]
    newActiveImages[swapIndex] = temp
    
    const reordered = newActiveImages.map((img, i) => ({ ...img, order: i }))
    const newGlobalImages = images.map(img => {
       if (img.store !== activeTab) return img
       const match = reordered.find(r => r.id === img.id)
       return match ? match : img
    })
    setImages(newGlobalImages)

    try {
      await reorderHeroImages(reordered.map(img => ({ id: img.id, order: img.order })))
    } catch (error) {
      console.error(error)
      alert("Failed to reorder images")
      router.refresh()
    }
  }

  // Update state when server sends new initialImages props
  useMemo(() => {
    setImages(initialImages)
  }, [initialImages])

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Hero Carousel</h1>
          <p className="text-gray-500">Manage the background images for the storefront hero section.</p>
        </div>
      </div>

      <div className="flex space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl w-max">
        <button
          onClick={() => handleTabChange("Appliances")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "Appliances" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Appliances
        </button>
        <button
          onClick={() => handleTabChange("Furniture")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            activeTab === "Furniture" ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-2xs" : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
          }`}
        >
          Furniture
        </button>
      </div>
      
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs p-4 sm:p-6">
        <div className="mb-6 border-b border-slate-100 dark:border-slate-800 pb-6 flex flex-col md:flex-row gap-6 justify-between items-start">
          <div className="max-w-xl">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload New Image</h3>
             <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
               Recommended: 1920×800px or similar widescreen (landscape) orientation.
               Uploading portrait photos from a phone may result in distorted or cropped backgrounds.
             </p>
             <input 
               type="file" 
               accept="image/*" 
               className="hidden" 
               ref={fileInputRef} 
               onChange={handleUpload}
             />
             <Button onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
               {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <UploadCloud className="w-4 h-4 mr-2" />}
               {isUploading ? "Uploading..." : "Select & Upload Image"}
             </Button>
          </div>
          
          {/* Mini live preview */}
          {activeImages.length > 0 && (
            <div className="w-full md:w-64 flex-shrink-0">
               <h4 className="text-xs font-bold uppercase text-slate-400 dark:text-slate-500 mb-2">Live Preview (First Slide)</h4>
               <div className="aspect-[16/7] rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 shadow-2xs relative">
                  <img src={activeImages[0].url} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                     <span className="text-white text-[10px] font-bold tracking-widest uppercase">Storefront Title</span>
                  </div>
               </div>
            </div>
          )}
        </div>
        
        {activeImages.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950/40">
            <ImageIcon className="mx-auto h-12 w-12 text-slate-400 mb-3" />
            <h3 className="text-sm font-medium text-slate-900 dark:text-slate-100">No images</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Currently using the fallback placeholder images on the storefront.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
             <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Active Carousel Sequence ({activeImages.length})</h4>
             {activeImages.map((img, index) => (
                <div key={img.id} className="flex flex-col sm:flex-row sm:items-center p-3.5 sm:p-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs group gap-3.5 sm:gap-4">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex-shrink-0 h-14 w-24 sm:h-16 sm:w-32 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 relative">
                      <img src={img.url} alt="Hero" className="h-full w-full object-cover" />
                    </div>
                    <div className="flex-grow min-w-0">
                      <div className="text-sm font-bold text-slate-900 dark:text-slate-100">Slide {index + 1}</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[140px] sm:max-w-xs">{img.url}</div>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="sm:hidden h-8 w-8 flex-shrink-0"
                      onClick={() => handleDelete(img.id)}
                      disabled={deletingId === img.id}
                    >
                      {deletingId === img.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-2 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800/80">
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold border-slate-200 dark:border-slate-800 flex items-center gap-1"
                        disabled={index === 0}
                        onClick={() => handleMove(index, 'up')}
                      >
                        <ArrowUp className="h-3.5 w-3.5" /> Move Up
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-3 text-xs font-semibold border-slate-200 dark:border-slate-800 flex items-center gap-1"
                        disabled={index === activeImages.length - 1}
                        onClick={() => handleMove(index, 'down')}
                      >
                        <ArrowDown className="h-3.5 w-3.5" /> Move Down
                      </Button>
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      className="hidden sm:flex"
                      onClick={() => handleDelete(img.id)}
                      disabled={deletingId === img.id}
                    >
                      {deletingId === img.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
             ))}
          </div>
        )}
      </div>
    </div>
  )
}
