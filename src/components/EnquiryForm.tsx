"use client"

import { useState } from "react"
import { submitEnquiry } from "@/app/actions/enquiry"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useStore } from "@/components/StoreProvider"

type EnquiryFormProps = {
  productId?: string
  productName?: string
  onSuccess?: () => void
}

export function EnquiryForm({ productId, productName, onSuccess }: EnquiryFormProps) {
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [message, setMessage] = useState("")
  const [preferWhatsapp, setPreferWhatsapp] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const { activeStore } = useStore()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate phone number (10 digits)
    if (!/^\d{10}$/.test(phone)) {
      setError("Please enter a valid 10-digit phone number.")
      return
    }

    setIsSubmitting(true)
    setError("")

    // Grab the session ID from local storage so we can tie this lead to their browsing history
    const sessionId = localStorage.getItem('visitor_session_id') || 'unknown'

    try {
      await submitEnquiry({
        name,
        phone,
        preferWhatsapp,
        message,
        productId,
        storeType: activeStore,
        sessionId
      })

      if (onSuccess) {
        onSuccess()
      } else {
        // Reset if no onSuccess handler
        setName("")
        setPhone("")
        setMessage("")
        alert("Enquiry submitted successfully! We will contact you soon.")
      }
    } catch (err) {
      setError("Failed to submit enquiry. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">{error}</div>}
      
      {productName && (
        <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm font-medium mb-4">
          Enquiring about: {productName}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Your Name *</Label>
        <Input 
          id="name" 
          value={name} 
          onChange={(e) => setName(e.target.value)} 
          required 
          placeholder="John Doe"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number *</Label>
        <Input 
          id="phone" 
          type="tel" 
          value={phone} 
          onChange={(e) => setPhone(e.target.value)} 
          required 
          placeholder="9876543210"
        />
      </div>

      <div className="flex items-center space-x-2 py-2">
        <input 
          type="checkbox" 
          id="whatsapp" 
          checked={preferWhatsapp} 
          onChange={(e) => setPreferWhatsapp(e.target.checked)} 
          className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
        />
        <Label htmlFor="whatsapp" className="font-normal cursor-pointer">Contact me on WhatsApp</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">Message (Optional)</Label>
        <Textarea 
          id="message" 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          rows={3} 
          placeholder="Any specific questions about delivery, colors, etc?"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit Enquiry"}
      </Button>
    </form>
  )
}
