import { EnquiryForm } from "@/components/EnquiryForm"
import { MapPin, Phone, Mail, Clock } from "lucide-react"

export default function ContactPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Contact Us</h1>
        <p className="text-gray-500 mb-12 text-lg">We'd love to hear from you. Please reach out with any general questions!</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border">
            <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
            <EnquiryForm />
          </div>

          <div className="space-y-8">
            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center"><MapPin className="w-5 h-5 mr-2 text-blue-600" /> Visit Our Store</h3>
              <p className="text-gray-600 ml-7">
                123 Main Street<br />
                Commercial Hub<br />
                Your City, State 123456
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center"><Phone className="w-5 h-5 mr-2 text-blue-600" /> Call or WhatsApp Us</h3>
              <p className="text-gray-600 ml-7">
                +91 97393 68487<br />
                +91 98765 00000
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold mb-4 flex items-center"><Clock className="w-5 h-5 mr-2 text-blue-600" /> Operating Hours</h3>
              <p className="text-gray-600 ml-7">
                Monday - Sunday: 10:00 AM - 9:00 PM<br />
                Open on all public holidays.
              </p>
            </div>
            
            <div className="mt-8 rounded-xl overflow-hidden shadow-sm h-64 bg-gray-200">
              {/* Map Embed Placeholder */}
              <div className="w-full h-full flex items-center justify-center text-gray-500 bg-slate-200">
                Interactive Map Placeholder
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
