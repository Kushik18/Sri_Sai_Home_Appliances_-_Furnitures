import { Truck, ShieldCheck, Lock } from "lucide-react"

type SpecData = Record<string, any>

export function TrustBadges({ specs }: { specs?: SpecData }) {
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
      icon: <Truck className="w-6 h-6 text-blue-600 mb-2" />,
      label: "Free Delivery",
    },

    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600 mb-2" />,
      label: warranty,
    },
    {
      icon: <Lock className="w-6 h-6 text-blue-600 mb-2" />,
      label: "Secure Transaction",
    }
  ]

  return (
    <div className="flex flex-wrap justify-start items-start gap-8 mb-8 pb-8 border-b border-gray-100 dark:border-slate-800">
      {badges.map((badge, idx) => (
        <div key={idx} className="flex flex-col items-center text-center max-w-[80px]">
          <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center mb-1">
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
