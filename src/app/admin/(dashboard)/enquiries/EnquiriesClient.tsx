"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { updateEnquiryStatus } from "./actions"
import { ExternalLink, Phone, MessageSquare, History } from "lucide-react"
import Link from "next/link"

type Visit = { id: string, pageUrl: string, createdAt: string, product: { name: string } | null }
type Enquiry = {
  id: string
  name: string
  phone: string
  message: string | null
  preferWhatsapp: boolean
  status: string
  createdAt: string
  storeType: string
  product: { id: string, name: string } | null
  session: { visits: Visit[] } | null
}

export default function EnquiriesClient({ enquiries }: { enquiries: Enquiry[] }) {
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("ALL")

  const handleStatusChange = async (id: string, newStatus: string) => {
    setIsUpdating(true)
    try {
      await updateEnquiryStatus(id, newStatus)
      if (selectedEnquiry && selectedEnquiry.id === id) {
        setSelectedEnquiry({ ...selectedEnquiry, status: newStatus })
      }
    } catch (err) {
      alert("Failed to update status")
    } finally {
      setIsUpdating(false)
    }
  }

  const filteredEnquiries = statusFilter === "ALL" 
    ? enquiries 
    : enquiries.filter(e => e.status === statusFilter)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Leads & Enquiries</h1>
        
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Filter by Status:</span>
          <Select value={statusFilter} onValueChange={(val: string | null) => val && setStatusFilter(val)}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Enquiries</SelectItem>
              <SelectItem value="NEW">New</SelectItem>
              <SelectItem value="CONTACTED">Contacted</SelectItem>
              <SelectItem value="RESOLVED">Resolved</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 hidden md:block shadow-2xs overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-950/50">
            <TableRow className="border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-slate-700 dark:text-slate-300">Date</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Customer</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Interest</TableHead>
              <TableHead className="text-slate-700 dark:text-slate-300">Status</TableHead>
              <TableHead className="text-right text-slate-700 dark:text-slate-300">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEnquiries.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-slate-500 dark:text-slate-400">
                  No enquiries found.
                </TableCell>
              </TableRow>
            ) : (
              filteredEnquiries.map((enquiry) => (
                <TableRow key={enquiry.id} className="border-b border-slate-100 dark:border-slate-800/60 cursor-pointer hover:bg-slate-50/50 dark:hover:bg-slate-800/40" onClick={() => setSelectedEnquiry(enquiry)}>
                  <TableCell className="whitespace-nowrap font-medium text-slate-900 dark:text-slate-100">
                    {new Date(enquiry.createdAt).toLocaleDateString()}
                    <div className="text-xs text-slate-500 dark:text-slate-400">{new Date(enquiry.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">{enquiry.name}</div>
                    <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                      {enquiry.preferWhatsapp ? <MessageSquare className="w-3 h-3 mr-1" /> : <Phone className="w-3 h-3 mr-1" />}
                      {enquiry.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    {enquiry.product ? (
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">{enquiry.product.name}</span>
                    ) : (
                      <span className="text-slate-500 dark:text-slate-400 text-sm">General Enquiry ({enquiry.storeType})</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                      enquiry.status === 'NEW' ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300' :
                      enquiry.status === 'CONTACTED' ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300' :
                      'bg-green-100 dark:bg-green-950/70 text-green-800 dark:text-green-300'
                    }`}>
                      {enquiry.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <button className="text-sm text-blue-600 dark:text-blue-400 font-semibold hover:underline">View Details</button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile view - Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {filteredEnquiries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
            No enquiries found.
          </div>
        ) : (
          filteredEnquiries.map((enquiry) => (
            <div 
              key={enquiry.id} 
              className="flex flex-col p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40"
              onClick={() => setSelectedEnquiry(enquiry)}
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-slate-100">{enquiry.name}</h3>
                  <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                    {enquiry.preferWhatsapp ? <MessageSquare className="w-3 h-3 mr-1" /> : <Phone className="w-3 h-3 mr-1" />}
                    {enquiry.phone}
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                    enquiry.status === 'NEW' ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-800 dark:text-blue-300' :
                    enquiry.status === 'CONTACTED' ? 'bg-amber-100 text-amber-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {enquiry.status}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-1">
                    {new Date(enquiry.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <div className="mt-2 text-sm">
                <span className="text-gray-500 mr-2">Interest:</span>
                {enquiry.product ? (
                  <span className="font-medium text-gray-900">{enquiry.product.name}</span>
                ) : (
                  <span className="text-gray-600 italic">General ({enquiry.storeType})</span>
                )}
              </div>
              
              <div className="mt-3 flex border-t border-gray-100 pt-3">
                <button className="w-full text-center text-sm text-blue-600 font-medium py-1">
                  View Details
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Enquiry Detail Modal */}
      <Dialog open={!!selectedEnquiry} onOpenChange={(open) => !open && setSelectedEnquiry(null)}>
        {selectedEnquiry && (
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Enquiry Details</span>
                <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      selectedEnquiry.status === 'NEW' ? 'bg-blue-100 text-blue-800' :
                      selectedEnquiry.status === 'CONTACTED' ? 'bg-amber-100 text-amber-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {selectedEnquiry.status}
                </span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="space-y-6">
                <div className="bg-gray-50 p-4 rounded-lg border">
                  <h3 className="text-sm font-semibold text-gray-500 mb-3">Customer Information</h3>
                  <p className="font-bold text-lg">{selectedEnquiry.name}</p>
                  <div className="flex items-center mt-2 text-gray-700">
                    <Phone className="w-4 h-4 mr-2" /> {selectedEnquiry.phone}
                  </div>
                  {selectedEnquiry.preferWhatsapp && (
                    <div className="mt-2 text-green-600 text-sm font-medium flex items-center">
                      <MessageSquare className="w-4 h-4 mr-2" /> Prefers WhatsApp Contact
                    </div>
                  )}
                  {selectedEnquiry.message && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm font-semibold mb-1">Message:</p>
                      <p className="text-gray-700 text-sm italic">"{selectedEnquiry.message}"</p>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-500">Update Status</h3>
                  <Select 
                    value={selectedEnquiry.status} 
                    onValueChange={(val: string | null) => val && handleStatusChange(selectedEnquiry.id, val)}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="NEW">New (Unread)</SelectItem>
                      <SelectItem value="CONTACTED">Contacted (In Progress)</SelectItem>
                      <SelectItem value="RESOLVED">Resolved (Closed)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h3 className="text-sm font-semibold text-blue-800 mb-3">Target Product</h3>
                  {selectedEnquiry.product ? (
                    <div>
                      <p className="font-bold">{selectedEnquiry.product.name}</p>
                      <Link href={`/product/${selectedEnquiry.product.id}`} target="_blank" className="text-blue-600 text-sm flex items-center mt-2 hover:underline">
                        View Product Page <ExternalLink className="w-3 h-3 ml-1" />
                      </Link>
                    </div>
                  ) : (
                    <p className="text-gray-600 italic">General Enquiry</p>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 mb-3 flex items-center">
                    <History className="w-4 h-4 mr-2" /> Browsing History
                  </h3>
                  <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-sm">
                    {selectedEnquiry.session && selectedEnquiry.session.visits.length > 0 ? (
                      <ul className="divide-y divide-slate-100 dark:divide-slate-800 max-h-48 overflow-y-auto">
                        {selectedEnquiry.session.visits.map(visit => (
                          <li key={visit.id} className="p-3 hover:bg-slate-50 dark:hover:bg-slate-900">
                            <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 mb-1">
                              <span>{new Date(visit.createdAt).toLocaleDateString()} {new Date(visit.createdAt).toLocaleTimeString()}</span>
                            </div>
                            <div className="font-medium text-blue-600 dark:text-blue-400 truncate">
                              {visit.product ? visit.product.name : visit.pageUrl}
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="p-4 text-gray-500 italic">No browsing history found for this session.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  )
}
