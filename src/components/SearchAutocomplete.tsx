"use client"

import { useState, useEffect, useRef, KeyboardEvent } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Search, X, Loader2, ArrowLeft } from "lucide-react"
import { getSearchSuggestions } from "@/app/actions/search"

type Suggestion = {
  id: string
  name: string
  thumbnailUrl: string | null
}

export function SearchAutocomplete({ activeStore, variant = "mobile" }: { activeStore: string, variant?: "mobile" | "desktop" }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState("")
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [showDropdown, setShowDropdown] = useState(false)
  
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    const search = searchParams.get("search")
    if (search) {
      setQuery(search)
    } else {
      setQuery("")
    }
  }, [searchParams, pathname])
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const latestRequestId = useRef(0)

  // Click outside to close desktop dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (variant === "desktop" && containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [variant])

  // Focus input on mobile when open
  useEffect(() => {
    if (variant === "mobile" && isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, variant])

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([])
      setIsLoading(false)
      return
    }

    setShowDropdown(true)
    setIsLoading(true)
    const requestId = ++latestRequestId.current

    const timer = setTimeout(async () => {
      try {
        const results = await getSearchSuggestions(query, activeStore)
        if (requestId === latestRequestId.current) {
          setSuggestions(results)
          setSelectedIndex(-1)
          setIsLoading(false)
        }
      } catch (error) {
        if (requestId === latestRequestId.current) {
          setIsLoading(false)
        }
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [query, activeStore])

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    const storePath = activeStore === "furniture" ? "furniture" : "appliances"

    if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
      const selected = suggestions[selectedIndex]
      router.push(`/product/${selected.id}`)
    } else if (query.trim()) {
      router.push(`/${storePath}?search=${encodeURIComponent(query.trim())}`)
    }
    
    if (variant === "mobile") setIsOpen(false)
    setShowDropdown(false)
    setSelectedIndex(-1)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (suggestions.length === 0) return

    if (e.key === "ArrowDown") {
      e.preventDefault()
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setSelectedIndex(prev => (prev > -1 ? prev - 1 : prev))
    } else if (e.key === "Escape") {
      if (variant === "mobile") {
        setIsOpen(false)
      } else {
        setShowDropdown(false)
      }
    }
  }

  const handleItemClick = (id: string) => {
    router.push(`/product/${id}`)
    if (variant === "mobile") setIsOpen(false)
    setShowDropdown(false)
  }

  const handleFocus = () => {
    if (query.trim()) {
      setShowDropdown(true)
    }
  }

  // --- MOBILE SEARCH OVERLAY ---
  if (variant === "mobile") {
    return (
      <>
        <button 
          onClick={() => setIsOpen(true)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors text-gray-700 dark:text-gray-200"
          aria-label="Search"
        >
          <Search className="w-5 h-5" />
        </button>

        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-black/50 z-[99]" 
              onClick={() => setIsOpen(false)} 
            />

            {/* Mobile Header Overlay */}
            <div className="fixed inset-x-0 top-0 z-[100] bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-2xl p-3 flex flex-col gap-2">
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full text-gray-600 dark:text-gray-300 flex-shrink-0"
                >
                  <ArrowLeft className="w-6 h-6" />
                </button>
                
                <div className="flex-1 flex items-center bg-gray-100 dark:bg-gray-800 rounded-full px-4 py-2 border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500">
                  <Search className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                  <input 
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Search ${activeStore === "furniture" ? "Furniture" : "Appliances"}...`}
                    className="w-full bg-transparent text-gray-900 dark:text-white placeholder-gray-400 outline-none text-base"
                    autoComplete="off"
                  />
                  {query.length > 0 && (
                    <button 
                      type="button" 
                      onClick={() => { setQuery(""); inputRef.current?.focus() }}
                      className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full text-sm flex-shrink-0 transition-colors shadow-sm"
                >
                  Search
                </button>
              </form>

              {/* Mobile Autocomplete Suggestions */}
              {query.trim().length > 0 && (
                <div className="w-full max-h-[calc(80vh-80px)] overflow-y-auto mt-1 border-t border-gray-100 dark:border-gray-800">
                  {isLoading ? (
                    <div className="flex items-center justify-center p-6 text-gray-500">
                      <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
                    </div>
                  ) : suggestions.length > 0 ? (
                    <ul className="divide-y divide-gray-100 dark:divide-gray-800/60">
                      {suggestions.map((suggestion) => (
                        <li 
                          key={suggestion.id}
                          onClick={() => handleItemClick(suggestion.id)}
                          className="flex items-center px-3 py-3 hover:bg-blue-50/60 dark:hover:bg-gray-800/80 cursor-pointer rounded-xl transition-colors"
                        >
                          {suggestion.thumbnailUrl ? (
                            <div className="w-12 h-12 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center mr-3 flex-shrink-0 overflow-hidden p-1 border border-gray-200/50 dark:border-gray-700/50">
                              <img src={suggestion.thumbnailUrl} alt="" className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal" />
                            </div>
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mr-3 flex-shrink-0 text-blue-600 dark:text-blue-400">
                              <Search className="w-5 h-5" />
                            </div>
                          )}
                          <div className="flex flex-col min-w-0 flex-1">
                            <span className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">{suggestion.name}</span>
                            <span className="text-xs text-blue-600 dark:text-blue-400 font-medium">View product details &rarr;</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                      No results found for "{query}"
                    </div>
                  )}
                </div>
              )}
            </div>
          </>
        )}
      </>
    )
  }

  // --- DESKTOP SEARCH ---
  return (
    <div className="flex items-center relative w-full" ref={containerRef}>
      <form 
        onSubmit={handleSubmit} 
        className="flex items-center bg-white dark:bg-gray-800 border-2 border-blue-600 dark:border-gray-600 focus-within:border-blue-700 dark:focus-within:border-gray-500 focus-within:ring-2 focus-within:ring-blue-300 dark:focus-within:ring-gray-700 rounded-full shadow-md w-full z-10 transition-all duration-200 overflow-hidden"
      >
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          placeholder={`Search ${activeStore === "furniture" ? "Furniture" : "Appliances"}...`}
          className="w-full bg-transparent outline-none text-slate-900 dark:text-white dark:placeholder-gray-400 px-5 py-3.5 text-base"
          autoComplete="off"
        />
        
        {query.length > 0 && (
          <button 
            type="button" 
            onClick={() => { setQuery(""); inputRef.current?.focus() }}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <button type="submit" className="bg-transparent hover:bg-blue-50 dark:hover:bg-gray-700 px-6 self-stretch flex items-center justify-center transition-colors">
          <Search className="text-blue-600 dark:text-blue-400 w-5 h-5" />
        </button>

        {/* Autocomplete Dropdown */}
        {showDropdown && query.trim().length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-xl overflow-hidden z-50">
            {isLoading ? (
              <div className="flex items-center justify-center p-4 text-gray-500">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            ) : suggestions.length > 0 ? (
              <ul className="max-h-72 overflow-y-auto py-1">
                {suggestions.map((suggestion, index) => (
                  <li 
                    key={suggestion.id}
                    onClick={() => handleItemClick(suggestion.id)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={`flex items-center px-4 py-3 cursor-pointer transition-colors ${
                      selectedIndex === index ? "bg-gray-100 dark:bg-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                    }`}
                  >
                    {suggestion.thumbnailUrl ? (
                      <div className="w-12 h-12 rounded-md bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-4 flex-shrink-0 overflow-hidden p-1.5 border border-gray-200/50 dark:border-gray-700/50">
                        <img src={suggestion.thumbnailUrl} alt="" className="object-contain w-full h-full mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                    ) : (
                      <Search className="w-5 h-5 text-gray-400 mr-4 flex-shrink-0" />
                    )}
                    <span className="text-base font-medium text-gray-800 dark:text-gray-200 truncate">{suggestion.name}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="p-4 text-sm text-center text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  )
}
