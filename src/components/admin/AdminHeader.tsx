"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Layers, 
  MessageSquare, 
  LogOut,
  Star,
  Flame,
  Image as ImageIcon,
  Award,
  ExternalLink
} from "lucide-react"
import { AdminThemeToggle } from "./AdminThemeToggle"
import MobileAdminSidebar from "@/app/admin/(dashboard)/MobileAdminSidebar"

export default function AdminHeader() {
  const pathname = usePathname()

  const navItems = [
    { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/admin/categories", icon: Layers, label: "Categories" },
    { href: "/admin/products", icon: ShoppingBag, label: "Products" },
    { href: "/admin/featured", icon: Star, label: "Featured" },
    { href: "/admin/bestsellers", icon: Flame, label: "Best Sellers" },
    { href: "/admin/hero", icon: ImageIcon, label: "Hero" },
    { href: "/admin/brands", icon: Award, label: "Brands" },
    { href: "/admin/enquiries", icon: MessageSquare, label: "Enquiries" },
  ]

  return (
    <header className="sticky top-0 z-40 w-full bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs">
      {/* Top Header Bar with Logo and Admin Actions */}
      <div className="px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Left: Store Logo & Admin Title */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-2.5 group">
            <img 
              src="/logo.png" 
              alt="Admin Logo" 
              className="h-8 sm:h-9 w-auto object-contain transition-transform group-hover:scale-105" 
            />
            <span className="text-xs font-extrabold uppercase tracking-widest bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-full">
              Admin
            </span>
          </Link>
        </div>

        {/* Center: Menu Bar Navigation (Desktop) */}
        <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60 shadow-2xs"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-400 dark:text-slate-500"}`} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right: Actions (Theme Toggle, View Store, Sign Out, Mobile Drawer) */}
        <div className="flex items-center gap-2">
          {/* View Store Button */}
          <Link
            href="/"
            target="_blank"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Open customer storefront in new tab"
          >
            <span>View Site</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>

          {/* Admin Dark Mode Toggle */}
          <AdminThemeToggle />

          {/* Sign Out Button */}
          <Link
            href="/api/auth/signout"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 border border-transparent hover:border-red-200 dark:hover:border-red-900 transition-all"
            title="Sign out of admin session"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>

          {/* Mobile Drawer */}
          <div className="lg:hidden">
            <MobileAdminSidebar />
          </div>
        </div>
      </div>
    </header>
  )
}
