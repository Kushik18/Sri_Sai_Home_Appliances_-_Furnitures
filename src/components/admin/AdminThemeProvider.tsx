"use client"

import React, { createContext, useContext, useState, useEffect } from "react"

type AdminTheme = "light" | "dark"

interface AdminThemeContextType {
  adminTheme: AdminTheme
  setAdminTheme: (theme: AdminTheme) => void
  toggleAdminTheme: () => void
}

const AdminThemeContext = createContext<AdminThemeContextType | undefined>(undefined)

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [adminTheme, setAdminThemeState] = useState<AdminTheme>("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const saved = localStorage.getItem("srisai_admin_theme") as AdminTheme
    if (saved === "light" || saved === "dark") {
      setAdminThemeState(saved)
    }
  }, [])

  useEffect(() => {
    if (!mounted) return
    const root = document.documentElement
    if (adminTheme === "dark") {
      root.classList.add("dark")
      root.style.colorScheme = "dark"
    } else {
      root.classList.remove("dark")
      root.style.colorScheme = "light"
    }
  }, [adminTheme, mounted])

  const setAdminTheme = (theme: AdminTheme) => {
    setAdminThemeState(theme)
    localStorage.setItem("srisai_admin_theme", theme)
  }

  const toggleAdminTheme = () => {
    setAdminTheme(adminTheme === "light" ? "dark" : "light")
  }

  const isDark = mounted && adminTheme === "dark"

  return (
    <AdminThemeContext.Provider value={{ adminTheme, setAdminTheme, toggleAdminTheme }}>
      <div className={`${isDark ? "dark bg-slate-950 text-slate-100" : "bg-slate-50 text-slate-900"} min-h-screen transition-colors duration-200`}>
        {children}
      </div>
    </AdminThemeContext.Provider>
  )
}

export function useAdminTheme() {
  const context = useContext(AdminThemeContext)
  if (!context) {
    throw new Error("useAdminTheme must be used within AdminThemeProvider")
  }
  return context
}
