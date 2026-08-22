"use client"

import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { UploadCloud, CheckCircle, AlertTriangle, FileSpreadsheet } from "lucide-react"
import * as XLSX from "xlsx"
import { processBulkUpload } from "./bulkActions"

type PreviewRow = {
  name: string
  quantity?: number
  brand?: string
  category?: string
  store?: string
  status: "MATCHED" | "NEW" | "SKIPPED"
  reason?: string
}

const KNOWN_BRANDS = ["SAMSUNG", "LG", "BOSCH", "WHIRLPOOL", "BAJAJ", "PIGEON", "PRESTIGE", "PHILIPS", "SONY", "PANASONIC", "HAIER", "VOLTAS", "GODREJ", "IFB", "HAVELLS", "V-GUARD", "USHA", "CROMPTON", "SYMPHONY", "KENT", "AQUAGUARD", "EUREKA FORBES", "MICROMAX", "ONEPLUS", "APPLE", "IPHONE", "DELL", "HP", "LENOVO", "ACER", "ASUS", "BUTTERFLY", "PREETHI", "SUJATA", "OPPO", "VIVO", "REALME", "XIAOMI", "MI", "POCO", "NOKIA", "MOTOROLA"]

function detectProductDetails(name: string) {
  const upperName = name.toUpperCase()
  
  // 1. Detect Brand (Whitelist check on first word)
  const firstWord = upperName.split(" ")[0]?.replace(/[^A-Z]/g, '') || ""
  let brand = ""
  if (KNOWN_BRANDS.includes(firstWord)) {
    brand = firstWord.charAt(0) + firstWord.slice(1).toLowerCase()
  } else {
    // Optionally check if any known brand is exactly present in the name as a standalone word
    for (const b of KNOWN_BRANDS) {
      if (new RegExp(`\\b${b}\\b`).test(upperName)) {
        brand = b.charAt(0) + b.slice(1).toLowerCase()
        break
      }
    }
  }

  // 2. Detect Category & Store
  let category = "Others"
  let store = "Appliances"

  // Careful with TABLE FAN vs DINING TABLE
  if (upperName.includes("TABLE FAN")) {
    category = "Fans"; store = "Appliances"
  } else if (upperName.includes("LED") || upperName.includes("QLED") || upperName.includes("OLED") || upperName.includes("TV") || upperName.includes("TELEVISION")) {
    category = "Televisions"; store = "Appliances"
  } else if (upperName.includes("REF") || upperName.includes("REFRIGERATOR") || upperName.includes("MINI BAR") || upperName.includes("DEEP FREEZER")) {
    category = "Refrigerators"; store = "Appliances"
  } else if (upperName.includes("W/M") || upperName.includes("WASHER") || upperName.includes("WASHING")) {
    category = "Washing Machines"; store = "Appliances"
  } else if ((upperName.includes("AC") || upperName.includes("A/C") || upperName.includes("TON")) && brand) {
    category = "Air Conditioners"; store = "Appliances"
  } else if (upperName.includes("C/F") || upperName.includes("P/F") || upperName.includes("CEILING FAN") || upperName.includes("PEDESTAL FAN") || upperName.includes("WALL FAN") || upperName.includes("TOWER FAN") || upperName.includes("EXHAUST FAN")) {
    category = "Fans"; store = "Appliances"
  } else if (upperName.includes("MIXER") || upperName.includes("GRINDER") || upperName.includes("BLENDER")) {
    category = "Mixers/Grinders"; store = "Appliances"
  } else if (upperName.includes("AIR COOLER") || upperName.includes("COOLER")) {
    category = "Coolers"; store = "Appliances"
  } else if (upperName.includes("GEYSER") || upperName.includes("WATER HEATER")) {
    category = "Geysers"; store = "Appliances"
  } else if (upperName.includes("WATER PURIFIER") || upperName.includes("W/P") || upperName.includes("RO") || upperName.includes("UV")) {
    category = "Water Purifiers"; store = "Appliances"
  } else if (upperName.includes("CHIMNEY") || upperName.includes("CHIMNY")) {
    category = "Chimneys"; store = "Appliances"
  } else if (upperName.includes("INDUCTION") || upperName.includes("LPG STOVE") || upperName.includes("STOVE") || upperName.includes("HOB")) {
    category = "Induction/Stoves"; store = "Appliances"
  } else if (upperName.includes("COOKER") && !upperName.includes("AIR")) {
    category = "Pressure Cookers"; store = "Appliances"
  } else if (upperName.includes("MOBILE") || upperName.includes("IPHONE") || upperName.includes("PHONE")) {
    category = "Mobiles"; store = "Appliances"
  } else if (upperName.includes("LAPTOP")) {
    category = "Laptops"; store = "Appliances"
  } else if (upperName.includes("SOFA")) {
    category = "Sofas"; store = "Furniture"
  } else if (upperName.includes("COT") || upperName.includes("DIWAN") || upperName.includes("BED")) {
    category = "Beds/Cots"; store = "Furniture"
  } else if (upperName.includes("CHAIR") || upperName.includes("STOOL") || upperName.includes("RECLINER")) {
    category = "Chairs"; store = "Furniture"
  } else if (upperName.includes("DINING") || (upperName.includes("TABLE") && !upperName.includes("FAN"))) {
    category = "Dining"; store = "Furniture"
  } else if (upperName.includes("WALLDROBE") || upperName.includes("WARDROBE")) {
    category = "Wardrobes"; store = "Furniture"
  } else if (upperName.includes("MATTRESS") || upperName.includes("MATRESS")) {
    category = "Mattresses"; store = "Furniture"
  } else if (upperName.includes("TEAPOY") || upperName.includes("MIRROR") || upperName.includes("DRESSING TABLE") || upperName.includes("SHOE RACK") || upperName.includes("CURTAIN") || upperName.includes("CARPET")) {
    category = "Others"; store = "Furniture" // Catch all other furniture
  }

  return { brand, category, store }
}

export function BulkUploadModal({ 
  open, 
  onOpenChange,
  existingProductNames
}: { 
  open: boolean
  onOpenChange: (open: boolean) => void
  existingProductNames: string[]
}) {
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<PreviewRow[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [results, setResults] = useState<{ matched: number, created: number, skipped: number, errors: string[] } | null>(null)
  
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return
    setFile(selectedFile)

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result
        const wb = XLSX.read(bstr, { type: 'binary' })
        const wsname = wb.SheetNames[0]
        const ws = wb.Sheets[wsname]
        
        // Convert to array of arrays
        const data = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 })
        
        const previewRows: PreviewRow[] = []
        const existingLower = existingProductNames.map(n => n.toLowerCase())

        for (let i = 0; i < data.length; i++) {
          const row = data[i]
          if (!row || row.length === 0) continue

          let name = ""
          let quantity: number | undefined = undefined

          for (const cell of row) {
            if (typeof cell === 'string' && cell.trim().length > 3) {
              if (cell.length > name.length) name = cell.trim()
            } else if (typeof cell === 'number') {
              quantity = cell
            } else if (typeof cell === 'string' && !isNaN(Number(cell))) {
              quantity = Number(cell)
            }
          }

          if (!name) {
            previewRows.push({ name: row.join(" | "), status: "SKIPPED", reason: "No valid product name found" })
            continue
          }

          const lowerName = name.toLowerCase()

          // Junk row detection
          if (
            lowerName.includes("transport charges") ||
            lowerName.includes("charges") ||
            lowerName.includes("gasket") ||
            lowerName.includes("gift bag") ||
            lowerName.includes("list of stock items") ||
            lowerName.includes("item name") || 
            lowerName.includes("description") || 
            lowerName.includes("report") ||
            /^\d{2}[-/]\d{2}[-/]\d{4}/.test(name) || // Date row
            /^\d{2}\s[a-z]{3}\s\d{4}/i.test(name)
          ) {
            previewRows.push({ name, status: "SKIPPED", reason: "Junk or metadata row" })
            continue
          }

          const matched = existingLower.includes(lowerName)
          const details = detectProductDetails(name)

          previewRows.push({
            name,
            quantity,
            brand: details.brand,
            category: details.category,
            store: details.store,
            status: matched ? "MATCHED" : "NEW"
          })
        }

        setPreview(previewRows)
      } catch (err) {
        alert("Failed to parse file. Please upload a valid Excel or CSV file.")
      }
    }
    reader.readAsBinaryString(selectedFile)
  }

  const handleConfirm = async () => {
    const validItems = preview.filter(p => p.status !== "SKIPPED").map(p => ({ 
      name: p.name, 
      quantity: p.quantity,
      brand: p.brand,
      category: p.category,
      store: p.store
    }))
    if (validItems.length === 0) return

    setIsProcessing(true)
    try {
      const res = await processBulkUpload(validItems)
      setResults(res)
    } catch (e) {
      alert("Something went wrong during import.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleClose = () => {
    setFile(null)
    setPreview([])
    setResults(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Upload Stock Sheet</DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6 mt-4">
          {!results ? (
            <>
              <div className="border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center bg-slate-50">
                <FileSpreadsheet className="w-12 h-12 text-slate-400 mb-4" />
                <h3 className="font-semibold text-lg mb-1">Select Excel or CSV File</h3>
                <p className="text-sm text-slate-500 mb-6 max-w-sm">
                  Upload your raw billing software export. The system will auto-detect product names, categorize them, and set brands.
                </p>
                <Button onClick={() => fileInputRef.current?.click()} variant="outline">
                  Browse Files
                </Button>
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="hidden" 
                  accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                  onChange={handleFileUpload}
                />
                {file && <p className="mt-4 text-sm font-medium text-slate-900">Selected: {file.name}</p>}
              </div>

              {preview.length > 0 && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden flex flex-col max-h-96">
                  <div className="bg-slate-100 dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-start sm:items-center text-sm font-semibold sticky top-0">
                    <span className="text-slate-900 dark:text-slate-100">Preview ({preview.length} rows processed)</span>
                    <div className="flex space-x-4 text-xs">
                      <span className="text-green-600 dark:text-green-400 font-bold">{preview.filter(p => p.status === 'MATCHED').length} Matched</span>
                      <span className="text-blue-600 dark:text-blue-400 font-bold">{preview.filter(p => p.status === 'NEW').length} New</span>
                      <span className="text-slate-500 dark:text-slate-400 font-bold">{preview.filter(p => p.status === 'SKIPPED').length} Skipped</span>
                    </div>
                  </div>
                  <div className="overflow-y-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-white dark:bg-slate-900 sticky top-0 shadow-2xs z-10 border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-4 py-2 text-slate-500 dark:text-slate-400 font-medium w-12">Status</th>
                          <th className="px-4 py-2 text-slate-500 dark:text-slate-400 font-medium">Item Name</th>
                          <th className="px-4 py-2 text-slate-500 dark:text-slate-400 font-medium">Auto-Categorization</th>
                          <th className="px-4 py-2 text-slate-500 dark:text-slate-400 font-medium w-24">Qty</th>
                          <th className="px-4 py-2 text-slate-500 dark:text-slate-400 font-medium">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {preview.map((row, i) => (
                          <tr key={i} className={row.status === 'SKIPPED' ? 'bg-slate-50 dark:bg-slate-950/40 text-slate-400 dark:text-slate-500' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/40'}>
                            <td className="px-4 py-2">
                              {row.status === 'MATCHED' && <CheckCircle className="w-5 h-5 text-green-500" />}
                              {row.status === 'NEW' && <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-bold">NEW</span>}
                              {row.status === 'SKIPPED' && <AlertTriangle className="w-5 h-5 text-gray-300" />}
                            </td>
                            <td className="px-4 py-2 font-medium truncate max-w-[300px]" title={row.name}>{row.name}</td>
                            <td className="px-4 py-2">
                              {row.status !== 'SKIPPED' && (
                                <div className="flex flex-col gap-1 text-xs">
                                  <span className="text-blue-600 font-semibold">{row.store} &gt; {row.category}</span>
                                  {row.brand && <span className="text-gray-500">Brand: {row.brand}</span>}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-2">{row.quantity !== undefined ? row.quantity : '-'}</td>
                            <td className="px-4 py-2 text-xs truncate max-w-[200px]">
                              {row.status === 'MATCHED' && "Will update stock"}
                              {row.status === 'NEW' && "Will PUBLISH"}
                              {row.status === 'SKIPPED' && row.reason}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-8 text-center space-y-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold">Import Complete</h2>
              
              <div className="flex justify-center gap-6 text-left max-w-md mx-auto bg-slate-50 p-6 rounded-xl border">
                <div>
                  <p className="text-3xl font-black text-green-600">{results.matched}</p>
                  <p className="text-sm font-medium text-slate-600">Stock Updated</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-blue-600">{results.created}</p>
                  <p className="text-sm font-medium text-slate-600">Published</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-slate-400">{results.skipped}</p>
                  <p className="text-sm font-medium text-slate-600">Skipped Rows</p>
                </div>
              </div>

              {results.errors.length > 0 && (
                <div className="bg-red-50 text-red-700 p-4 rounded-lg text-sm text-left max-w-md mx-auto h-32 overflow-y-auto">
                  <p className="font-bold mb-2">Errors encountered:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    {results.errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4">
          {!results ? (
            <>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={handleConfirm} 
                disabled={!preview.length || isProcessing || preview.filter(p => p.status !== 'SKIPPED').length === 0}
              >
                {isProcessing ? "Processing..." : "Confirm Import"}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>Done</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
