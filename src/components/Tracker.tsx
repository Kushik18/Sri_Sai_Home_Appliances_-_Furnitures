"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { useStore } from "./StoreProvider"

function generateSessionId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function Tracker() {
  const pathname = usePathname()
  const { activeStore } = useStore()

  useEffect(() => {
    // Exclude admin routes from tracking
    if (pathname.startsWith('/admin')) return

    let sessionId = localStorage.getItem('visitor_session_id')
    if (!sessionId) {
      sessionId = generateSessionId()
      localStorage.setItem('visitor_session_id', sessionId)
    }

    // Extract product ID if on a product page
    const productMatch = pathname.match(/\/product\/([a-zA-Z0-9-]+)/)
    const productId = productMatch ? productMatch[1] : null

    // Send tracking data to API
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId,
        pageUrl: pathname,
        productId,
        storeType: activeStore
      })
    }).catch(console.error)

  }, [pathname, activeStore])

  return null
}
