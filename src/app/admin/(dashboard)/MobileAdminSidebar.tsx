"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LayoutDashboard, Layers, ShoppingBag, MessageSquare, LogOut, Star, Flame, Image as ImageIcon, Award, ExternalLink, Settings } from "lucide-react"
import { AdminThemeToggle } from "@/components/admin/AdminThemeToggle"
import AdminSignOutButton from "@/components/admin/AdminSignOutButton"

export default function MobileAdminSidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/categories", icon: Layers, label: "Categories" },
    { href: "/admin/products", icon: ShoppingBag, label: "Products" },
    { href: "/admin/featured", icon: Star, label: "Featured Arrivals" },
    { href: "/admin/bestsellers", icon: Flame, label: "Best Sellers" },
    { href: "/admin/hero", icon: ImageIcon, label: "Hero Carousel" },
    { href: "/admin/brands", icon: Award, label: "Brands" },
    { href: "/admin/enquiries", icon: MessageSquare, label: "Enquiries" },
    { href: "/admin/settings", icon: Settings, label: "Settings" },
  ]

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="p-2 text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none">
        <Menu className="h-6 w-6" />
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] p-0 flex flex-col bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        {/* Header with Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200 dark:border-slate-800 flex-shrink-0">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Admin Logo" className="h-8 w-auto object-contain" />
            <span className="font-bold text-lg text-slate-900 dark:text-white">Admin</span>
          </div>
        </div>

        {/* Theme Toggle & Store Link inside Drawer */}
        <div className="px-4 py-3 bg-slate-50 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <AdminThemeToggle />
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link 
                key={item.href}
                href={item.href} 
                onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive 
                    ? 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Sign Out Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex-shrink-0">
          <AdminSignOutButton className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors w-full cursor-pointer" />
        </div>
      </SheetContent>
    </Sheet>
  )
}
