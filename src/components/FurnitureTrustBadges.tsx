import { Truck, ShieldCheck, Wrench, ArrowUpRight } from "lucide-react"

type SpecData = Record<string, any>

export function FurnitureTrustBadges({ specs }: { specs?: SpecData }) {
  // Try to extract warranty info from specs if it exists
  let warranty = "1 Year Warranty" // Placeholder default
  
  if (specs) {
    // Check if new nested format
    const isNestedFormat = Object.values(specs).some(val => typeof val === 'object' && val !== null && !Array.isArray(val))
    
    if (isNestedFormat && specs["Item details"] && specs["Item details"]["Warranty"]) {
      warranty = specs["Item details"]["Warranty"]
    } else if (!isNestedFormat && specs["Warranty"]) {
      // Old flat format
      warranty = specs["Warranty"]
    }
  }

  const badges = [
    {
      icon: <Truck className="w-6 h-6 text-indigo-600 mb-2" />,
      label: "Safe & Careful Delivery",
    },
    {
      icon: <Wrench className="w-6 h-6 text-indigo-600 mb-2" />,
      label: "Expert Assembly",
    },
    {
      icon: <ArrowUpRight className="w-6 h-6 text-indigo-600 mb-2" />,
      label: "Room of Choice",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600 mb-2" />,
      label: warranty,
    }
  ]

  return (
    <div className="flex flex-wrap justify-start items-start gap-8 mb-8 pb-8 border-b border-gray-100 dark:border-slate-800">
      {badges.map((badge, idx) => (
        <div key={idx} className="flex flex-col items-center text-center max-w-[90px]">
          <div className="w-12 h-12 rounded-full bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center mb-1">
            {badge.icon}
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 leading-tight">
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  )
}
