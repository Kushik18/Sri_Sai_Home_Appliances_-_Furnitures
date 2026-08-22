"use client"

import { useAdminTheme } from "./AdminThemeProvider"
import { Sun, Moon } from "lucide-react"

export function AdminThemeToggle() {
  const { adminTheme, toggleAdminTheme } = useAdminTheme()

  return (
    <button
      onClick={toggleAdminTheme}
      type="button"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-2xs text-xs font-semibold"
      title="Toggle Admin Dark Mode"
      aria-label="Toggle Admin Theme"
    >
      {adminTheme === "dark" ? (
        <>
          <Sun className="w-4 h-4 text-amber-400" />
          <span>Light</span>
        </>
      ) : (
        <>
          <Moon className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Dark</span>
        </>
      )}
    </button>
  )
}
