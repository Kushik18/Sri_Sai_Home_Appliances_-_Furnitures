"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { usePathname, useSearchParams } from "next/navigation"

type StoreType = "appliances" | "furniture"

interface StoreContextType {
  activeStore: StoreType
  setActiveStore: (store: StoreType) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [activeStore, setActiveStoreState] = useState<StoreType>("appliances")
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    // If route is /furniture, set to furniture
    if (pathname === "/furniture") {
      setActiveStoreState("furniture")
      localStorage.setItem("srisai_store", "furniture")
      return
    }
    // If route is /appliances, set to appliances
    if (pathname === "/appliances") {
      setActiveStoreState("appliances")
      localStorage.setItem("srisai_store", "appliances")
      return
    }

    // On root homepage '/', check for explicit ?store= parameter
    if (pathname === "/") {
      const storeParam = searchParams.get("store") as StoreType
      if (storeParam === "furniture" || storeParam === "appliances") {
        setActiveStoreState(storeParam)
        localStorage.setItem("srisai_store", storeParam)
        return
      }
      // When opening main home page without store query param, default to appliances
      setActiveStoreState("appliances")
      localStorage.setItem("srisai_store", "appliances")
      return
    }

    // For subpages (e.g. /product/[id]), preserve saved store choice
    const savedStore = localStorage.getItem("srisai_store") as StoreType
    if (savedStore && (savedStore === "appliances" || savedStore === "furniture")) {
      setActiveStoreState(savedStore)
    } else {
      setActiveStoreState("appliances")
    }
  }, [pathname, searchParams])

  const setActiveStore = (store: StoreType) => {
    setActiveStoreState(store)
    localStorage.setItem("srisai_store", store)
  }

  return (
    <StoreContext.Provider value={{ activeStore, setActiveStore }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error("useStore must be used within a StoreProvider")
  }
  return context
}

