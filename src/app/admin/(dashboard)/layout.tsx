import { ReactNode } from "react"
import Link from "next/link"
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
  Settings
} from "lucide-react"

import { AdminThemeProvider } from "@/components/admin/AdminThemeProvider"
import AdminHeader from "@/components/admin/AdminHeader"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) {
    redirect("/admin/login")
  }

  return (
    <AdminThemeProvider>
      <div className="flex flex-col min-h-screen w-full">
        {/* Top Menu Bar Header with Logo & Admin Dark Mode Toggle */}
        <AdminHeader />

        <div className="flex flex-1 w-full overflow-hidden">
          {/* Desktop Left Sidebar */}
          <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 hidden md:block flex-shrink-0">
            <div className="h-full flex flex-col justify-between">
              <nav className="p-4 space-y-1.5 overflow-y-auto">
                <Link href="/admin" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <LayoutDashboard className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Dashboard</span>
                </Link>
                <Link href="/admin/categories" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Layers className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Categories</span>
                </Link>
                <Link href="/admin/products" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <ShoppingBag className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Products</span>
                </Link>
                <Link href="/admin/featured" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Star className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Featured Arrivals</span>
                </Link>
                <Link href="/admin/bestsellers" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Flame className="h-4 w-4 text-amber-500" />
                  <span>Best Sellers</span>
                </Link>
                <Link href="/admin/hero" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <ImageIcon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Hero Carousel</span>
                </Link>
                <Link href="/admin/brands" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Award className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Brands</span>
                </Link>
                <Link href="/admin/enquiries" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <MessageSquare className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Enquiries</span>
                </Link>
                <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors">
                  <Settings className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                  <span>Settings</span>
                </Link>
              </nav>
              <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors">
                  <LogOut className="h-4 w-4" />
                  <span>Sign Out</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Content Viewport */}
          <main className="flex-1 overflow-y-auto p-3 sm:p-6 md:p-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-[calc(100vh-4rem)]">
            {children}
          </main>
        </div>
      </div>
    </AdminThemeProvider>
  )
}
