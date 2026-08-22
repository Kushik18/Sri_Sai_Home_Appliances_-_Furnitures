import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MessageSquare, AlertTriangle, Layers, TrendingUp } from "lucide-react"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function AdminDashboard() {
  // Get counts
  const categoriesCount = await prisma.category.count()
  const productsCount = await prisma.product.count()
  
  const newEnquiriesCount = await prisma.enquiry.count({
    where: { status: "NEW" }
  })

  const lowStockProducts = await prisma.product.findMany({
    where: { stockQuantity: { lt: 5 } },
    take: 5,
    orderBy: { stockQuantity: 'asc' }
  })

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const visitorsToday = await prisma.visit.count({
    where: { createdAt: { gte: today } }
  })

  // Get recent enquiries
  const recentEnquiries = await prisma.enquiry.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Page Views (Today)</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{visitorsToday}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Across all pages</p>
          </CardContent>
        </Card>
        
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">New Enquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{newEnquiriesCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Pending follow-up</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{lowStockProducts.length}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">Items with &lt; 5 stock</p>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-700 dark:text-slate-300">Total Products</CardTitle>
            <Layers className="h-4 w-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{productsCount}</div>
            <p className="text-xs text-slate-500 dark:text-slate-400">In {categoriesCount} categories</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Recent Enquiries</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEnquiries.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">No recent enquiries.</p>
            ) : (
              <div className="space-y-4">
                {recentEnquiries.map(enquiry => (
                  <div key={enquiry.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">{enquiry.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{enquiry.phone} • {new Date(enquiry.createdAt).toLocaleDateString()}</p>
                    </div>
                    <Link href="/admin/enquiries" className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline">
                      View
                    </Link>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/admin/enquiries" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">View all enquiries &rarr;</Link>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xs">
          <CardHeader>
            <CardTitle className="text-slate-900 dark:text-white">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400 py-4">All products are well stocked.</p>
            ) : (
              <div className="space-y-4">
                {lowStockProducts.map(product => (
                  <div key={product.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100 line-clamp-1">{product.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{product.brand}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-950/60 text-red-800 dark:text-red-300 border border-transparent dark:border-red-900/60 px-2.5 py-0.5 text-xs font-semibold">
                        {product.stockQuantity} left
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/admin/products" className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline">Manage inventory &rarr;</Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
