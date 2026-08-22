"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

const defaultImages = [
  "/images/1/Consumer-Electronics-Appliance-companies.jpg",
  "/images/1/desktop-small-spaces.avif",
  "/images/1/images.jpg",
  "/images/1/intro-1665155220.jpg"
]

export default function ApplianceHero({ 
  activeStore, 
  images = [] 
}: { 
  activeStore: string
  images?: { id: string, url: string }[] 
}) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const displayImages = images.length > 0 ? images.map(img => img.url) : defaultImages

  useEffect(() => {
    // Only animate if there's more than 1 image
    if (displayImages.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displayImages.length)
    }, 5000)
    
    return () => clearInterval(timer)
  }, [displayImages.length])

  // Safety catch in case images change length and currentIndex becomes out of bounds
  if (currentIndex >= displayImages.length) {
    setCurrentIndex(0);
  }

  return (
    <section className={`relative text-white py-20 lg:py-32 px-4 transition-colors duration-500 overflow-hidden bg-slate-900`}>
      <div className="absolute inset-0 z-0 bg-black">
        {displayImages.map((src, index) => (
          <img 
            key={src + index}
            src={src} 
            alt="Home Background" 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-60" : "opacity-0"
            }`} 
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
      </div>
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between relative z-10">
        <div className="md:w-1/2 space-y-6">
          <span className="font-semibold tracking-wider uppercase text-sm text-blue-300 drop-shadow-md">
            SRI SAI HOME APPLIANCES
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight drop-shadow-lg">
            Upgrade Your Home with Premium Appliances
          </h1>
          <p className="text-lg md:text-xl opacity-90 max-w-lg leading-relaxed drop-shadow-md">
            Discover top brands and the latest technology in refrigerators, washing machines, and more.
          </p>
          <div className="pt-4">
            <Link href={`/${activeStore}`} className="inline-flex items-center px-8 py-4 rounded-full font-bold shadow-lg transition transform hover:scale-105 bg-white text-blue-900 hover:bg-blue-50">
              Browse Appliances <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
      
      {/* Carousel Indicators - only show if there's more than 1 image */}
      {displayImages.length > 1 && (
        <div className="absolute bottom-12 left-0 right-0 z-20 flex justify-center items-center gap-3">
          {displayImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`h-2 rounded-full transition-all duration-300 shadow-md ${
                index === currentIndex 
                  ? "w-10 bg-blue-500" 
                  : "w-4 bg-white/60 hover:bg-white/90"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
