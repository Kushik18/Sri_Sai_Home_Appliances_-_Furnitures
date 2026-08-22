"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Plus } from "lucide-react"
import { createCategory, deleteCategory } from "./actions"

type Store = { id: string, name: string }
type Category = {
  id: string
  name: string
  storeId: string | null
  store: Store | null
  _count: { products: number }
}

export default function CategoryClient({ 
  categories, 
  stores 
}: { 
  categories: Category[], 
  stores: Store[] 
}) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [name, setName] = useState("")
  const [storeId, setStoreId] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name || !storeId) return

    setIsSubmitting(true)
    setError("")
    
    try {
      await createCategory({ name, storeId })
      setIsDialogOpen(false)
      setName("")
      setStoreId("")
    } catch (err) {
      setError("Failed to create category")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteCategory(id)
      } catch (err: any) {
        alert(err.message || "Failed to delete category")
      }
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Categories</h1>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger render={<Button />}>
            <Plus className="w-4 h-4 mr-2" /> Add Category
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Category</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 pt-4">
              {error && <div className="text-sm text-red-500">{error}</div>}
              
              <div className="space-y-2">
                <Label htmlFor="name">Category Name</Label>
                <Input 
                  id="name" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g., Refrigerators"
                  required 
                />
              </div>

              <div className="space-y-2">
                  <Label htmlFor="store">Store</Label>
                  <Select value={storeId} onValueChange={(val: string | null) => val && setStoreId(val)} required>
                    <SelectTrigger>
                    <SelectValue placeholder="Select a store" />
                  </SelectTrigger>
                  <SelectContent>
                    {stores.map(store => (
                      <SelectItem key={store.id} value={store.id}>
                        {store.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Category"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hidden md:block shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-slate-700 dark:text-slate-300">Name</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Store</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Products</TableHead>
              <TableHead className="text-right text-slate-700 dark:text-slate-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-slate-500 dark:text-slate-400">
                  No categories found. Create one to get started.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                  <TableCell className="font-semibold text-slate-900 dark:text-slate-100">{category.name}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{category.store?.name || 'No Store'}</TableCell>
                  <TableCell className="text-slate-700 dark:text-slate-300">{category._count.products}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(category.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {categories.length === 0 ? (
          <div className="text-center py-6 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            No categories found. Create one to get started.
          </div>
        ) : (
          categories.map((category) => (
            <div key={category.id} className="flex flex-col p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100 text-lg">{category.name}</h3>
                  <span className="inline-flex items-center rounded-full border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:text-slate-300 mt-1">
                    {category.store?.name || 'No Store'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{category._count.products}</span>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Products</div>
                </div>
              </div>
              
              <div className="mt-3 flex gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                <Button variant="outline" className="flex-1 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/40" onClick={() => handleDelete(category.id)}>
                  <Trash2 className="w-4 h-4 mr-2" /> Delete
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
