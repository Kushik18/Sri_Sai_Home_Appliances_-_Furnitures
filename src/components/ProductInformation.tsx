"use client"

import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"

// specs could be a nested object (new format) or a flat object (old format)
type SpecData = Record<string, any>

export function ProductInformation({ specs }: { specs: SpecData }) {
  // If no specs, render nothing
  if (!specs || typeof specs !== 'object' || Object.keys(specs).length === 0) {
    return null
  }

  // Determine if it's the new nested format or old flat format
  // It's nested if at least one value is an object (and not an array/null)
  const isNestedFormat = Object.values(specs).some(val => typeof val === 'object' && val !== null && !Array.isArray(val))

  let categoriesToRender: { title: string, items: { label: string, value: string }[] }[] = []
  let whatsInTheBox: { label: string, value: string }[] = []

  if (isNestedFormat) {
    for (const [category, attributes] of Object.entries(specs)) {
      if (category === "What's in the box") {
        if (Array.isArray(attributes)) {
          whatsInTheBox = attributes.map(v => ({ label: '', value: String(v) }))
        } else {
          whatsInTheBox = Object.entries(attributes as Record<string, any>).map(([k, v]) => ({ label: k, value: String(v) }))
        }
        continue
      }
      
      const items = Object.entries(attributes as Record<string, any>).map(([k, v]) => ({ label: k, value: String(v) }))
      if (items.length > 0) {
        categoriesToRender.push({ title: category, items })
      }
    }
  } else {
    // OLD FORMAT FALLBACK
    const CATEGORY_MAP: Record<string, string[]> = {
      "Item details": ["Brand", "Model Number", "Model Name", "Country of Origin", "Warranty"],
      "Design": ["Form Factor", "Shape", "Ear Placement", "Cabinet material", "Mount type"],
      "Style": ["Colour", "Finish", "Color"],
      "Battery": ["Playtime", "Charging type", "Battery Life", "Battery Capacity"],
      "Audio": ["Channels", "RMS Output", "Peak Output", "Frequency Response", "Drivers", "Subwoofer", "SNR", "Impedance", "Sensitivity"],
      "Connectivity": ["Bluetooth", "HDMI ARC", "Optical", "USB", "AUX", "Line-In", "Wi-Fi", "Connectivity Technology"],
      "Controls": ["Remote", "LED display", "EQ modes", "Bass/Treble adjustment", "Controls"],
      "Measurements": ["Dimensions", "Weight"],
      "What's in the box": ["Box Contents", "Included Components"]
    }
    const groupedSpecs: Record<string, { label: string, value: string }[]> = {}
    const processedKeys = new Set<string>()

    for (const [category, keywords] of Object.entries(CATEGORY_MAP)) {
      for (const [key, value] of Object.entries(specs)) {
        if (keywords.some(kw => key.toLowerCase().includes(kw.toLowerCase()))) {
          if (!processedKeys.has(key)) {
            if (!groupedSpecs[category]) groupedSpecs[category] = []
            groupedSpecs[category].push({ label: key, value: String(value) })
            processedKeys.add(key)
          }
        }
      }
    }

    const remaining: { label: string, value: string }[] = []
    for (const [key, value] of Object.entries(specs)) {
      if (!processedKeys.has(key)) {
        remaining.push({ label: key, value: String(value) })
      }
    }
    
    if (remaining.length > 0) {
      groupedSpecs["Additional details"] = remaining
    }

    whatsInTheBox = groupedSpecs["What's in the box"] || []
    delete groupedSpecs["What's in the box"]

    categoriesToRender = Object.entries(groupedSpecs).map(([title, items]) => ({ title, items }))
  }

  if (categoriesToRender.length === 0 && whatsInTheBox.length === 0) return null

  // Split into two columns for desktop
  const leftColumn = categoriesToRender.filter((_, idx) => idx % 2 === 0)
  const rightColumn = categoriesToRender.filter((_, idx) => idx % 2 !== 0)

  return (
    <div className="mb-8">
      <h3 className="text-xl font-bold mb-4">Product Information</h3>
      
      {categoriesToRender.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start mb-6">
          <div className="flex flex-col gap-4">
            {leftColumn.map((section, idx) => (
              <AccordionSection key={`left-${idx}`} title={section.title} items={section.items} />
            ))}
          </div>
          
          {rightColumn.length > 0 && (
            <div className="flex flex-col gap-4">
              {rightColumn.map((section, idx) => (
                <AccordionSection key={`right-${idx}`} title={section.title} items={section.items} />
              ))}
            </div>
          )}
        </div>
      )}

      {whatsInTheBox.length > 0 && (
        <div className="mt-8 bg-gray-50 dark:bg-slate-900 rounded-xl p-6 border border-gray-100 dark:border-slate-800">
          <h4 className="font-bold text-gray-900 dark:text-white mb-3">What's in the box</h4>
          <ul className="list-disc pl-5 text-gray-600 dark:text-gray-300 space-y-1">
            {whatsInTheBox.map((item, idx) => (
              <li key={idx}>
                {item.label ? (
                  <><span className="font-medium text-gray-800 dark:text-gray-200">{item.label}:</span> {item.value}</>
                ) : (
                  <span>{item.value}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

function AccordionSection({ title, items }: { title: string, items: { label: string, value: string }[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-950 shadow-sm transition-all duration-200">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-5 py-3.5 bg-gray-50 hover:bg-gray-100 dark:bg-slate-900 dark:hover:bg-slate-800 transition text-left"
      >
        <span className="font-bold text-gray-900 dark:text-white">{title}</span>
        {isOpen ? <ChevronUp className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 flex-shrink-0" />}
      </button>
      
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
      >
        <div className="px-5 py-4 border-t border-gray-200 dark:border-slate-800">
          <table className="w-full text-sm text-left">
            <tbody>
              {items.map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-slate-800 last:border-0">
                  <th className="py-2.5 pr-4 font-semibold text-gray-900 dark:text-white w-1/3 align-top">{item.label}</th>
                  <td className="py-2.5 text-gray-600 dark:text-gray-300 align-top break-words">{item.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
