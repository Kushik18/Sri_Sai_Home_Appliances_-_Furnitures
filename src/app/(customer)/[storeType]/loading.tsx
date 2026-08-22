export default function ListingLoading() {
  return (
    <div className="container mx-auto px-4 py-8 animate-pulse">
      {/* Header */}
      <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded mb-6" />
      <div className="flex justify-between items-end mb-6 pb-4 border-b dark:border-slate-800">
        <div>
          <div className="h-8 w-40 bg-slate-200 dark:bg-slate-800 rounded mb-2" />
          <div className="h-4 w-28 bg-slate-100 dark:bg-slate-900 rounded" />
        </div>
        <div className="hidden sm:flex gap-3">
          <div className="h-9 w-32 bg-slate-100 dark:bg-slate-900 rounded-xl" />
          <div className="h-9 w-36 bg-slate-100 dark:bg-slate-900 rounded-xl" />
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <aside className="hidden md:block w-64 flex-shrink-0 space-y-6">
          <div className="h-10 w-full bg-slate-200 dark:bg-slate-800 rounded-md" />
          <div className="space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-7 w-full bg-slate-100 dark:bg-slate-900 rounded" />
            ))}
          </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5 sm:gap-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-950 border dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="w-full aspect-square bg-slate-100 dark:bg-slate-900" />
              <div className="p-4 space-y-3">
                <div className="h-3 w-16 bg-slate-100 dark:bg-slate-900 rounded" />
                <div className="h-4 w-full bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="h-4 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
                <div className="flex justify-between pt-2 border-t dark:border-slate-800">
                  <div className="h-6 w-16 bg-slate-100 dark:bg-slate-900 rounded-full" />
                  <div className="h-6 w-12 bg-slate-100 dark:bg-slate-900 rounded-full" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
