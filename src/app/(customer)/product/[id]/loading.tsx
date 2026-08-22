export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-6" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Image gallery */}
        <div className="space-y-4">
          <div className="w-full aspect-square bg-slate-100 dark:bg-slate-900 rounded-2xl" />
          <div className="flex gap-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="w-20 h-20 bg-slate-100 dark:bg-slate-900 rounded-xl flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Product info */}
        <div className="space-y-5">
          <div className="h-4 w-20 bg-slate-100 dark:bg-slate-900 rounded" />
          <div className="h-8 w-full bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
          <div className="h-6 w-24 bg-green-100 dark:bg-green-900/30 rounded-full" />
          <div className="h-px w-full bg-slate-100 dark:bg-slate-800" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-4 bg-slate-100 dark:bg-slate-900 rounded" style={{ width: `${85 - i * 8}%` }} />
            ))}
          </div>
          <div className="flex gap-3 pt-4">
            <div className="flex-1 h-14 bg-green-500/20 rounded-full" />
            <div className="flex-1 h-14 bg-slate-100 dark:bg-slate-900 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
