"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, XCircle, Share2, MessageSquare, ChevronLeft, ChevronRight, ChevronUp, ChevronDown } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ProductInformation } from "@/components/ProductInformation"
import { TrustBadges } from "@/components/TrustBadges"
import { FurnitureTrustBadges } from "@/components/FurnitureTrustBadges"
import { WhatsAppButton } from "@/components/WhatsAppCustomButton"
import DOMPurify from "isomorphic-dompurify"

/** Sanitize HTML to prevent XSS before using dangerouslySetInnerHTML */
const sanitize = (html: string) => DOMPurify.sanitize(html)

const formatSquashedText = (text: string | null) => {
  if (!text) return "";

  // 1. Initial cleanup of non-breaking spaces and carriage returns
  let cleanText = text
    .replace(/&nbsp;/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n');

  // 2. Fix hard-wrapped word splits, hyphens, and isolated letter linebreaks from fixed-column copy-paste
  cleanText = cleanText.replace(/([a-zA-Z0-9])-\s*\n\s*([a-zA-Z])/g, '$1-$2');
  cleanText = cleanText.replace(/\b([a-zA-Z])\s*\n\s*([a-zA-Z]{2,})\b/g, '$1$2');
  cleanText = cleanText.replace(/\b([A-Z])\s*\n\s*([A-Z])\b/g, '$1$2');

  // 3. Handle ✅ formatted text
  if (cleanText.includes('✅')) {
    let parts = cleanText.replace(/^<p>/i, '').replace(/<\/p>$/i, '').split('✅');
    
    let intro = parts[0].trim();
    if (intro.toUpperCase().includes('ABOUT THIS ITEM')) {
      intro = intro.replace(/ABOUT THIS ITEM/i, '<h3 class="text-xl font-bold mb-4 mt-2 text-gray-900 dark:text-white">About this item</h3>');
    } else if (intro) {
      intro = intro
        .split(/\n\n+/)
        .map(p => `<p class="mb-4">${p.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim()}</p>`)
        .join('');
    }

    let extraBlocks = "";
    
    let items = parts.slice(1).map(part => {
      const productDetailsMatch = part.match(/PRODUCT DETAILS \/ SPECIFICATIONS/i);
      const whatsInBoxMatch = part.match(/WHAT'S IN THE BOX/i);
      
      let firstMatchIndex = -1;
      if (productDetailsMatch) firstMatchIndex = productDetailsMatch.index!;
      if (whatsInBoxMatch && (firstMatchIndex === -1 || whatsInBoxMatch.index! < firstMatchIndex)) {
        firstMatchIndex = whatsInBoxMatch.index!;
      }
      
      if (firstMatchIndex !== -1) {
        let bulletContent = part.substring(0, firstMatchIndex).trim();
        extraBlocks += part.substring(firstMatchIndex);
        bulletContent = bulletContent.replace(/\n/g, ' ').replace(/\s+/g, ' ');
        return `<li class="ml-5 list-disc mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">✅ ${bulletContent}</li>`;
      }
      
      let bulletContent = part.trim().replace(/\n/g, ' ').replace(/\s+/g, ' ');
      return `<li class="ml-5 list-disc mb-3 text-gray-700 dark:text-gray-300 leading-relaxed">✅ ${bulletContent}</li>`;
    });

    let html = `${intro}\n<ul class="mb-8 mt-4">\n${items.join('\n')}\n</ul>\n`;

    if (extraBlocks) {
      extraBlocks = extraBlocks.replace(/<\/?p[^>]*>/gi, '<br/>');
      extraBlocks = extraBlocks.replace(/(?:<br\s*\/?>|\s)*(?:<strong[^>]*>|<b>)?\s*(PRODUCT DETAILS \/ SPECIFICATIONS)\s*(?:<\/strong>|<\/b>)?(?:<br\s*\/?>|\s)*/gi, '###PRODUCT_DETAILS###');
      extraBlocks = extraBlocks.replace(/(?:<br\s*\/?>|\s)*(?:<strong[^>]*>|<b>)?\s*(WHAT(?:'|&#39;)S IN THE BOX)\s*(?:<\/strong>|<\/b>)?(?:<br\s*\/?>|\s)*/gi, '###WHATS_IN_THE_BOX###');

      extraBlocks = extraBlocks.replace(/([A-Z][A-Za-z0-9\-\(\) &]+):/g, '<br/><span class="font-semibold text-gray-900 dark:text-gray-100">$1:</span>');
      extraBlocks = extraBlocks.replace(/ - /g, '<br/>• ');

      extraBlocks = extraBlocks.replace(/###PRODUCT_DETAILS###/g, '<h3 class="text-xl font-bold mt-8 mb-2 text-gray-900 dark:text-white border-t pt-6">Product Details / Specifications</h3>');
      extraBlocks = extraBlocks.replace(/###WHATS_IN_THE_BOX###/g, '<h3 class="text-xl font-bold mt-8 mb-2 text-gray-900 dark:text-white border-t pt-6">What\'s in the box</h3>');

      extraBlocks = extraBlocks.replace(/(<\/h3>)(?:<br\s*\/?>|\s|&nbsp;)+/gi, '$1');
      extraBlocks = extraBlocks.replace(/(?:<br\s*\/?>|\s|&nbsp;)+(<h3)/gi, '$1');
      extraBlocks = extraBlocks.replace(/(?:<br\s*\/?>\s*){2,}/gi, '<br/>');

      html += `<div class="text-gray-700 dark:text-gray-300 space-y-2 leading-relaxed">${extraBlocks}</div>`;
    }

    return `<div class="whitespace-normal">${html}</div>`;
  }

  // 4. Handle HTML or plain text descriptions
  const hasHtml = /<[a-z][\s\S]*>/i.test(cleanText);

  if (hasHtml) {
    return cleanText
      .replace(/[ \t]+/g, ' ')
      .replace(/text-justify/g, 'text-left');
  }

  // 5. Convert plain text into formatted paragraphs
  const paragraphs = cleanText
    .split(/\n\n+/)
    .map(p => {
      const singleLine = p
        .replace(/\n/g, ' ')
        .replace(/[ \t]+/g, ' ')
        .trim();
      return singleLine ? `<p class="mb-4">${singleLine}</p>` : '';
    })
    .filter(Boolean);

  return paragraphs.length > 0 ? paragraphs.join('') : `<p class="mb-4">${cleanText.trim()}</p>`;
};

type Product = {
  id: string
  name: string
  brand: string | null

  description: string | null
  legacyDescription: string | null
  features: string[]
  whatsInTheBox: string[]

  inStock: boolean
  imageUrls: string[]
  specs: any
  store: { name: string }
  category?: { name: string } | null
  categoryId?: string | null
  material?: string | null
  color?: string | null
  dimensions?: string | null
}

type RelatedProduct = {
  id: string
  name: string
  brand: string | null
  imageUrls: string[]
  inStock: boolean
}

const materialCareNotes: Record<string, string> = {
  "Velvet": "Spot clean with a damp cloth, avoid direct sunlight to prevent fading.",
  "Leather": "Wipe with a dry cloth, condition every 6-12 months.",
  "Solid Wood": "Dust regularly, use coasters, and avoid direct exposure to heat and sunlight.",
  "Engineered Wood": "Wipe with a slightly damp cloth and dry immediately. Do not use abrasive cleaners.",
  "Fabric": "Vacuum regularly. Spot clean stains immediately with mild detergent.",
  "Metal": "Wipe with a soft dry cloth. Avoid harsh chemicals."
}

export default function ProductDetailClient({ 
  product, 
  relatedProducts = [] 
}: { 
  product: Product, 
  relatedProducts?: RelatedProduct[] 
}) {
  const router = useRouter()
  const [activeImage, setActiveImage] = useState(product.imageUrls[0] || null)
  const [recentlyViewed, setRecentlyViewed] = useState<RelatedProduct[]>([])
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const thumbnailRef = useRef<HTMLDivElement>(null);
  const [canScrollUp, setCanScrollUp] = useState(false);
  const [canScrollDown, setCanScrollDown] = useState(false);

  const checkScroll = () => {
    const el = thumbnailRef.current;
    if (!el) return;
    const isDesktop = window.innerWidth >= 768;
    if (isDesktop) {
      const hasScroll = el.scrollHeight > el.clientHeight;
      setCanScrollUp(el.scrollTop > 5);
      setCanScrollDown(hasScroll && el.scrollTop + el.clientHeight < el.scrollHeight - 5);
    } else {
      const hasScroll = el.scrollWidth > el.clientWidth;
      setCanScrollUp(el.scrollLeft > 5);
      setCanScrollDown(hasScroll && el.scrollLeft + el.clientWidth < el.scrollWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const el = thumbnailRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [product.imageUrls]);

  useEffect(() => {
    if (!activeImage || !thumbnailRef.current) return;
    const currentIndex = product.imageUrls.indexOf(activeImage);
    if (currentIndex !== -1) {
      const activeBtn = thumbnailRef.current.children[currentIndex] as HTMLElement;
      if (activeBtn) {
        activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
      }
    }
    checkScroll();
  }, [activeImage]);

  const scrollThumbnails = (direction: 'up' | 'down') => {
    const el = thumbnailRef.current;
    if (!el) return;
    const isDesktop = window.innerWidth >= 768;
    const scrollAmount = 150;
    if (isDesktop) {
      el.scrollBy({ top: direction === 'up' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    } else {
      el.scrollBy({ left: direction === 'up' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = product.name;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch (err) {
        console.error("Error sharing:", err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      handleNextImage();
    }
    if (isRightSwipe) {
      handlePreviousImage();
    }
  };

  const handlePreviousImage = (e?: any) => {
    e?.stopPropagation?.();
    if (!activeImage) return;
    const currentIndex = product.imageUrls.indexOf(activeImage);
    if (currentIndex > 0) {
      setActiveImage(product.imageUrls[currentIndex - 1]);
    } else {
      setActiveImage(product.imageUrls[product.imageUrls.length - 1]);
    }
  };

  const handleNextImage = (e?: any) => {
    e?.stopPropagation?.();
    if (!activeImage) return;
    const currentIndex = product.imageUrls.indexOf(activeImage);
    if (currentIndex < product.imageUrls.length - 1) {
      setActiveImage(product.imageUrls[currentIndex + 1]);
    } else {
      setActiveImage(product.imageUrls[0]);
    }
  };

  // Keyboard navigation for Lightbox modal images
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.code === "ArrowLeft") {
        e.preventDefault();
        e.stopPropagation();
        handlePreviousImage();
      } else if (e.key === "ArrowRight" || e.code === "ArrowRight") {
        e.preventDefault();
        e.stopPropagation();
        handleNextImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown, true);
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [isLightboxOpen, activeImage, product.imageUrls]);

  const isAvailable = product.inStock
  const isFurniture = product.category?.name?.toLowerCase().includes('furniture')

  // Combine whatsInTheBox into specs if it's not empty, so it renders in the accordion
  const enhancedSpecs = { ...product.specs }
  if (product.whatsInTheBox && product.whatsInTheBox.length > 0) {
    enhancedSpecs["What's in the box"] = product.whatsInTheBox
  }

  // Handle recently viewed logic
  useEffect(() => {
    try {
      const stored = localStorage.getItem('recentlyViewed')
      let items: RelatedProduct[] = stored ? JSON.parse(stored) : []
      
      // Remove this product if it's already in the list
      items = items.filter(p => p.id !== product.id)
      
      // Prepare the current product to be stored
      const currentProduct: RelatedProduct = {
        id: product.id,
        name: product.name,
        brand: product.brand,
        imageUrls: product.imageUrls,
        inStock: product.inStock
      }
      
      // Add to beginning and take top 10
      const updatedItems = [currentProduct, ...items].slice(0, 10)
      
      localStorage.setItem('recentlyViewed', JSON.stringify(updatedItems))
      
      // For display, we want to show the OTHER recently viewed items (not the current one)
      setRecentlyViewed(items.slice(0, 10))
    } catch (e) {
      console.error("Could not parse recently viewed items from local storage", e)
    }
  }, [product.id])

  const renderProductCard = (p: RelatedProduct) => (
    <Link key={p.id} href={`/product/${p.id}`} className="group block h-full">
      <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col h-full">
        <div className="aspect-square bg-white relative overflow-hidden flex items-center justify-center p-4 border-b dark:border-slate-800">
          {p.imageUrls[0] ? (
            <img src={p.imageUrls[0]} alt={p.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition duration-300" />
          ) : (
            <span className="text-gray-400 font-medium text-xs">No Image</span>
          )}
        </div>
        <div className="p-4 flex flex-col flex-grow">
          <span className="text-[10px] font-bold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">{p.brand}</span>
          <h3 className="font-medium text-gray-900 dark:text-gray-100 text-sm mb-2 line-clamp-2 flex-grow">{p.name}</h3>
          <div className="mt-auto pt-2">
            <span className={`px-2 py-1 rounded text-[10px] font-bold ${p.inStock ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
              {p.inStock ? "In Stock" : "Out of Stock"}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )

  return (
    <div className="bg-gray-50 dark:bg-slate-950 min-h-screen py-8 text-gray-900 dark:text-gray-100">
      <div className="container mx-auto px-4">
        
        {/* Breadcrumb & Back */}
        <div className="mb-6 flex items-center justify-between">
          <button 
            onClick={() => {
              if (typeof window !== 'undefined' && window.history.length > 1 && document.referrer.includes(window.location.host)) {
                router.back();
              } else {
                router.push(product.store?.name ? `/${product.store.name.toLowerCase()}` : '/');
              }
            }}
            className="inline-flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
          <div className="text-sm text-gray-400 dark:text-gray-500">
            {product.category?.name || 'Uncategorized'}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
            
            {/* Image Gallery */}
            <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100 dark:border-slate-800 flex flex-col md:flex-row gap-6 items-center md:items-start justify-start lg:justify-center">
              
              {/* Thumbnails */}
              {product.imageUrls.length > 1 && (
                <div className="flex flex-row md:flex-col items-center justify-center gap-2 order-2 md:order-1 w-full md:w-auto flex-shrink-0">
                  {/* Upper Arrow (Desktop) / Left Arrow (Mobile) */}
                  {(canScrollUp || canScrollDown || product.imageUrls.length > 3) && (
                    <button 
                      type="button"
                      onClick={() => scrollThumbnails('up')}
                      disabled={!canScrollUp}
                      aria-label="Scroll up photos"
                      title="Previous photos"
                      className={`p-1.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xs transition-all flex items-center justify-center text-gray-700 dark:text-gray-200 ${
                        !canScrollUp 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'opacity-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-110 active:scale-95'
                      }`}
                    >
                      <ChevronUp className="w-4 h-4 hidden md:block" />
                      <ChevronLeft className="w-4 h-4 md:hidden" />
                    </button>
                  )}

                  {/* Scrollable Thumbnails */}
                  <div 
                    ref={thumbnailRef}
                    onScroll={checkScroll}
                    className="flex md:flex-col flex-nowrap overflow-x-auto md:overflow-y-auto w-full md:w-auto flex-shrink-0 justify-start gap-3 py-1 px-1 md:py-0 md:pr-1 max-h-[400px] scrollbar-hide scroll-smooth"
                  >
                    {product.imageUrls.map((url, idx) => (
                      <button 
                        key={idx} 
                        onClick={() => setActiveImage(url)}
                        className={`w-16 h-16 rounded-lg border-2 bg-white overflow-hidden flex-shrink-0 transition-all ${activeImage === url ? 'border-blue-500 shadow-sm ring-1 ring-blue-100 ring-offset-1 dark:ring-blue-900/50' : 'border-gray-200 dark:border-slate-800 opacity-70 hover:opacity-100'}`}
                      >
                        <img src={url} alt={`Thumbnail ${idx+1}`} className="object-cover w-full h-full" />
                      </button>
                    ))}
                  </div>

                  {/* Down Arrow (Desktop) / Right Arrow (Mobile) */}
                  {(canScrollUp || canScrollDown || product.imageUrls.length > 3) && (
                    <button 
                      type="button"
                      onClick={() => scrollThumbnails('down')}
                      disabled={!canScrollDown}
                      aria-label="Scroll down photos"
                      title="Next photos"
                      className={`p-1.5 rounded-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-xs transition-all flex items-center justify-center text-gray-700 dark:text-gray-200 ${
                        !canScrollDown 
                          ? 'opacity-30 cursor-not-allowed' 
                          : 'opacity-100 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 hover:scale-110 active:scale-95'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4 hidden md:block" />
                      <ChevronRight className="w-4 h-4 md:hidden" />
                    </button>
                  )}
                </div>
              )}

              <div 
                className="aspect-square relative bg-white rounded-xl w-full max-w-[400px] border border-gray-100 dark:border-slate-800 shadow-sm order-1 md:order-2 flex-shrink-0"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                {activeImage ? (
                  <Dialog open={Boolean(isLightboxOpen)} onOpenChange={(open) => setIsLightboxOpen(open)}>
                    <DialogTrigger className="w-full h-full absolute inset-0 outline-none p-4 cursor-zoom-in hover:bg-gray-50/50 dark:hover:bg-white/5 rounded-xl transition-colors group">
                      <img src={activeImage} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform duration-300" />
                    </DialogTrigger>
                    <DialogContent 
                      onKeyDown={(e) => {
                        if (e.key === "ArrowLeft" || e.code === "ArrowLeft") {
                          e.preventDefault();
                          e.stopPropagation();
                          handlePreviousImage(e);
                        } else if (e.key === "ArrowRight" || e.code === "ArrowRight") {
                          e.preventDefault();
                          e.stopPropagation();
                          handleNextImage(e);
                        }
                      }}
                      className="max-w-[95vw] md:max-w-[90vw] w-full max-h-[95vh] md:max-h-[90vh] h-full p-2 md:p-6 bg-white dark:bg-slate-950 flex flex-col rounded-3xl text-gray-900 dark:text-gray-100" 
                      showCloseButton={true}
                    >
                      <DialogHeader className="sr-only">
                        <DialogTitle>Product Image</DialogTitle>
                      </DialogHeader>
                      <div 
                        className="w-full flex-grow relative flex items-center justify-center overflow-hidden mb-4 min-h-0 bg-white rounded-2xl border dark:border-slate-800"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                      >
                        {product.imageUrls.length > 1 && (
                          <button 
                            type="button"
                            tabIndex={-1}
                            onClick={handlePreviousImage}
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 bg-white text-gray-900 p-3 md:p-4 rounded-full shadow-md hover:shadow-lg transition-shadow z-10 outline-none border border-gray-100 cursor-pointer active:scale-95"
                            aria-label="Previous Image"
                          >
                            <ChevronLeft className="w-6 h-6 md:w-8 md:h-8" />
                          </button>
                        )}
                        <img src={activeImage} alt={product.name} className="object-contain max-w-full max-h-full select-none mix-blend-multiply p-2" draggable={false} />
                        {product.imageUrls.length > 1 && (
                          <button 
                            type="button"
                            tabIndex={-1}
                            onClick={handleNextImage}
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 bg-white text-gray-900 p-3 md:p-4 rounded-full shadow-md hover:shadow-lg transition-shadow z-10 outline-none border border-gray-100 cursor-pointer active:scale-95"
                            aria-label="Next Image"
                          >
                            <ChevronRight className="w-6 h-6 md:w-8 md:h-8" />
                          </button>
                        )}
                      </div>
                      
                      {/* Thumbnails below main image */}
                      {product.imageUrls.length > 1 && (
                        <div className="flex-shrink-0 flex justify-center overflow-x-auto gap-4 px-2 scrollbar-hide w-full max-w-full py-1">
                          {product.imageUrls.map((url, idx) => (
                            <button 
                              key={idx} 
                              onClick={() => setActiveImage(url)}
                              className={`w-16 h-16 md:w-20 md:h-20 rounded-xl border-2 bg-white overflow-hidden flex-shrink-0 transition-all ${activeImage === url ? 'border-blue-500 shadow-md ring-2 ring-blue-100 ring-offset-1' : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'}`}
                            >
                              <img src={url} alt={`Thumbnail ${idx+1}`} className="object-cover w-full h-full" />
                            </button>
                          ))}
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                ) : (
                  <div className="w-full h-full bg-white flex items-center justify-center text-gray-400 absolute inset-0 rounded-xl">
                    No Image Available
                  </div>
                )}
              </div>
            </div>

            {/* Product Info */}
            <div className="p-8 flex flex-col">
              <div className="mb-2">
                <span className="text-sm font-bold tracking-widest text-blue-600 uppercase">{product.brand}</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4 leading-tight">{product.name}</h1>
              

              <div className="flex items-center gap-2 mb-8 pb-8 border-b border-gray-100 dark:border-slate-800">
                {isAvailable ? (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-semibold">
                    <CheckCircle2 className="w-4 h-4 mr-1.5" /> In Stock
                  </span>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-sm font-semibold">
                    <XCircle className="w-4 h-4 mr-1.5" /> Out of Stock
                  </span>
                )}
                <span className="text-gray-400 text-sm">|</span>
                <span className="text-gray-500 dark:text-gray-400 text-sm">Product Code: {product.id.slice(0, 8).toUpperCase()}</span>
              </div>

              {isFurniture && (product.material || product.color || product.dimensions) && (
                <div className="mb-8 grid grid-cols-2 gap-4 bg-gray-50 dark:bg-slate-950 p-4 rounded-xl border border-gray-100 dark:border-slate-800">
                  {product.dimensions && (
                    <div className="col-span-2">
                      <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Dimensions</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{product.dimensions}</span>
                    </div>
                  )}
                  {product.material && (
                    <div>
                      <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Material</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{product.material}</span>
                    </div>
                  )}
                  {product.color && (
                    <div>
                      <span className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">Color</span>
                      <span className="text-gray-900 dark:text-gray-100 font-medium">{product.color}</span>
                    </div>
                  )}
                </div>
              )}

              <div className="mb-8 flex-grow">
                <h3 className="text-lg font-bold mb-3 dark:text-white">Product Description</h3>
                
                {/* 1. New Structured Description */}
                {(product.features?.length > 0 || product.description) ? (
                  <div className="text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.description && (
                      <div 
                        className={`mb-6 ${
                          "break-words max-w-full overflow-hidden " +
                          "[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-4 " +
                          "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 " +
                          "[&_p]:mb-4 [&_strong]:font-bold " +
                          "[&_table]:w-full [&_table]:border-collapse [&_table]:mb-6 [&_table]:text-sm [&_table]:rounded-md [&_table]:overflow-hidden " +
                          "[&_th]:border [&_th]:border-gray-200 [&_th]:px-4 [&_th]:py-3 [&_th]:bg-gray-50 [&_th]:font-bold [&_th]:text-left " +
                          "[&_td]:border [&_td]:border-gray-200 [&_td]:px-4 [&_td]:py-3 [&_td]:align-top"
                        }`}
                        dangerouslySetInnerHTML={{ __html: sanitize(formatSquashedText(product.description)) }} 
                      />
                    )}
                    
                    {product.features?.length > 0 && (
                      <div>
                        <h4 className="font-bold text-gray-900 dark:text-white mb-3 uppercase tracking-wide text-sm">About this item</h4>
                        <ul className="space-y-2">
                          {product.features.map((feature, idx) => (
                            <li key={idx} className="flex gap-3">
                              <span className="text-green-500 font-bold mt-0.5">✓</span>
                              <span dangerouslySetInnerHTML={{ __html: sanitize(feature) }} />
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-8">
                      {isFurniture ? <FurnitureTrustBadges specs={product.specs} /> : <TrustBadges specs={product.specs} />}
                    </div>
                  </div>
                ) : (
                  // 2. Legacy Description Fallback
                  product.legacyDescription ? (
                    (() => {
                      const desc = formatSquashedText(product.legacyDescription);
                      
                      const commonClassName = "text-gray-600 dark:text-gray-300 leading-relaxed break-words max-w-full overflow-hidden " +
                        "[&_ul]:list-disc [&_ul]:ml-5 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-5 [&_ol]:mb-4 " +
                        "[&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-3 [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 " +
                        "[&_p]:mb-4 [&_strong]:font-bold " +
                        "[&_table]:w-full [&_table]:border-collapse [&_table]:mb-6 [&_table]:text-sm [&_table]:rounded-md [&_table]:overflow-hidden " +
                        "[&_th]:border [&_th]:border-gray-200 [&_th]:px-4 [&_th]:py-3 [&_th]:bg-gray-50 [&_th]:font-bold [&_th]:text-left " +
                        "[&_td]:border [&_td]:border-gray-200 [&_td]:px-4 [&_td]:py-3 [&_td]:align-top";

                      return (
                        <>
                          <div dangerouslySetInnerHTML={{ __html: sanitize(desc) }} className={commonClassName} />
                          <div className="my-8">
                            {isFurniture ? <FurnitureTrustBadges specs={product.specs} /> : <TrustBadges specs={product.specs} />}
                          </div>
                        </>
                      )
                    })()
                  ) : (
                    // 3. No Description
                    <>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8">No description provided.</p>
                      {isFurniture ? <FurnitureTrustBadges specs={product.specs} /> : <TrustBadges specs={product.specs} />}
                    </>
                  )
                )}
              </div>

              {/* Specifications */}

              {enhancedSpecs && typeof enhancedSpecs === 'object' && Object.keys(enhancedSpecs).length > 0 && (
                <ProductInformation specs={enhancedSpecs} />
              )}

              {/* Care Instructions */}
              {isFurniture && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-slate-950 border border-gray-100 dark:border-slate-800 rounded-xl">
                  <h4 className="text-sm font-bold text-gray-900 dark:text-gray-100 mb-2 uppercase tracking-wide">Care Instructions</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                    {product.material && materialCareNotes[product.material] 
                      ? materialCareNotes[product.material]
                      : "To keep this piece looking its best, we recommend regular light dusting. Wipe any spills immediately with a soft, dry cloth. Avoid harsh chemicals or abrasive cleaners."}
                  </p>
                </div>
              )}

              <div className="mt-auto pt-6 flex flex-col sm:flex-row gap-4">
                <WhatsAppButton 
                  productName={product.name} 
                  productCode={product.id} 
                />

                <button 
                  onClick={handleShare}
                  title={isCopied ? "Link copied!" : "Share product"}
                  className="sm:w-auto w-full bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-900 dark:text-gray-100 px-6 py-4 rounded-xl font-bold text-lg transition flex items-center justify-center"
                >
                  {isCopied ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Share2 className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-center sm:text-left text-gray-400 mt-4">
                Enquiring reserves this item for you. Payment is completed in-store.
              </p>

            </div>
          </div>
        </div>

        {/* You Might Also Like */}
        {relatedProducts.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.map(renderProductCard)}
            </div>
          </div>
        )}

        {/* Recently Viewed */}
        {recentlyViewed.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">Recently Viewed</h2>
            <div className="flex overflow-x-auto gap-4 md:gap-6 pb-4 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
              {recentlyViewed.map((p) => (
                <div key={`wrapper-${p.id}`} className="flex-shrink-0 w-[200px] md:w-[280px]">
                  {renderProductCard(p)}
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
