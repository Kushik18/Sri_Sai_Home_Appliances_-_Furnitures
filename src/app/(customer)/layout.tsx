"use client"

import { ReactNode, Suspense } from "react"
import { StoreProvider, useStore } from "@/components/StoreProvider"
import Link from "next/link"
import { MapPin, Phone, Search, Menu, ShoppingCart, ShieldCheck, Truck, Star, Clock, X, Tv, Sofa, Sparkles, MessageCircle } from "lucide-react"
import { ThemeToggle } from "@/components/ThemeToggle"

import { usePathname, useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { SearchAutocomplete } from "@/components/SearchAutocomplete"
import SplashScreen from "@/components/SplashScreen"

function Header() {
  const { activeStore, setActiveStore } = useStore()
  const pathname = usePathname()
  const router = useRouter()
  const [isStoryMode, setIsStoryMode] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleScroll = () => {
      // Hide header when scrolling into the furniture storytelling sequence (approx 60vh to 480vh)
      if (activeStore === 'furniture' && pathname === '/' && window.scrollY > window.innerHeight * 0.6 && window.scrollY < window.innerHeight * 4.8) {
        setIsStoryMode(true)
      } else {
        setIsStoryMode(false)
      }
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [activeStore, pathname])

  const handleTabClick = (store: "appliances" | "furniture") => {
    setActiveStore(store)
    if (pathname === "/") {
      window.scrollTo({ top: 0, behavior: "smooth" })
    } else {
      router.push("/")
    }
  }

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isMobileMenuOpen])

  return (
    <>
      <header className={`fixed w-full top-0 z-50 transition-all duration-700 ${isStoryMode ? 'opacity-0 -translate-y-full pointer-events-none' : 'bg-white dark:bg-gray-950 shadow-sm opacity-100 translate-y-0'}`}>
        {/* Main Nav */}
        <div className="w-full px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 md:gap-3 mr-2 flex-shrink-0">
            <img src="/logo.png" alt="Sri Sai Logo" className="h-8 md:h-10 w-auto flex-shrink-0" />
            <span className="text-sm leading-tight md:text-xl font-bold tracking-tighter text-blue-900 dark:text-blue-100">
              Sri Sai Home Appliances and Furnitures<span className="text-blue-500">.</span>
            </span>
          </Link>
          
          {/* Persistent Search Bar for Desktop */}
          <div className="hidden md:flex flex-grow max-w-2xl mx-4">
             <SearchAutocomplete activeStore={activeStore} variant="desktop" />
          </div>
          
          {/* Store Switcher Tabs - Only show on Home Page */}
          {pathname === "/" && (
            <div className="hidden md:flex bg-slate-100 dark:bg-gray-900 p-1 rounded-full">
              <button 
                onClick={() => handleTabClick("appliances")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeStore === "appliances" ? "bg-white dark:bg-gray-800 shadow text-blue-900 dark:text-blue-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                Home Appliances
              </button>
              <button 
                onClick={() => handleTabClick("furniture")}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeStore === "furniture" ? "bg-white dark:bg-gray-800 shadow text-amber-900 dark:text-amber-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                Furniture
              </button>
            </div>
          )}

          <div className="flex items-center space-x-2 md:space-x-4 relative flex-shrink-0">
            <ThemeToggle />
            <div className="md:hidden">
              <SearchAutocomplete activeStore={activeStore} variant="mobile" />
            </div>
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
              aria-label="Open navigation menu"
            >
              <Menu className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </div>

        {/* Mobile Store Switcher Tabs - Only show on Home Page */}
        {pathname === "/" && (
          <div className="md:hidden container mx-auto px-4 pb-4">
            <div className="flex w-full bg-slate-100 dark:bg-gray-900 p-1 rounded-full text-sm">
              <button 
                onClick={() => handleTabClick("appliances")}
                className={`flex-1 py-2 rounded-full font-medium transition-all ${
                  activeStore === "appliances" ? "bg-white dark:bg-gray-800 shadow text-blue-900 dark:text-blue-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                Appliances
              </button>
              <button 
                onClick={() => handleTabClick("furniture")}
                className={`flex-1 py-2 rounded-full font-medium transition-all ${
                  activeStore === "furniture" ? "bg-white dark:bg-gray-800 shadow text-amber-900 dark:text-amber-100" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                }`}
              >
                Furniture
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Mobile Navigation Drawer - Outside <header> to fix CSS transform containing block bug */}
      {isMobileMenuOpen && (
        <>
          {/* Dark Overlay */}
          <div 
            className="fixed inset-0 bg-black/70 backdrop-blur-xs z-[1000] md:hidden transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Sliding Side Drawer */}
          <div className="fixed inset-y-0 right-0 z-[1001] w-[88vw] max-w-xs sm:max-w-sm bg-white dark:bg-slate-900 border-l border-gray-100 dark:border-slate-800 shadow-2xl flex flex-col justify-between p-5 pt-[max(1.25rem,env(safe-area-inset-top))] pb-[max(1.5rem,env(safe-area-inset-bottom))] overflow-y-auto md:hidden transition-all duration-300">
            <div>
              {/* Drawer Header & Full Branding */}
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-slate-800">
                <div className="flex items-center gap-3 pr-2">
                  <img src="/logo.png" alt="Sri Sai Logo" className="h-9 w-auto flex-shrink-0" />
                  <div className="flex flex-col">
                    <span className="font-bold text-blue-950 dark:text-blue-100 text-sm leading-tight">
                      Sri Sai Home Appliances & Furnitures
                    </span>
                    <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                      Mysuru Showroom
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <ThemeToggle />
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Nav Links */}
              <div className="py-5 flex flex-col gap-5">
                {/* Shop Departments Section */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 px-1">
                    Shop Departments
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {/* Home Appliances Active State Indicator */}
                    <button
                      onClick={() => {
                        handleTabClick("appliances")
                        setIsMobileMenuOpen(false)
                      }}
                      className={`flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.99] ${
                        activeStore === "appliances"
                          ? "bg-blue-50 dark:bg-blue-950/50 text-blue-900 dark:text-blue-200 border-l-4 border-blue-600 font-bold shadow-xs"
                          : "hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-gray-800 dark:text-gray-200 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Tv className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className="text-sm">Home Appliances</span>
                      </div>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                        activeStore === "appliances" 
                          ? "bg-blue-600 text-white" 
                          : "bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      }`}>
                        {activeStore === "appliances" ? "Active" : "Explore"}
                      </span>
                    </button>

                    {/* Furniture Collection & Sub-items */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => {
                          handleTabClick("furniture")
                          setIsMobileMenuOpen(false)
                        }}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all active:scale-[0.99] ${
                          activeStore === "furniture"
                            ? "bg-amber-50 dark:bg-amber-950/50 text-amber-900 dark:text-amber-200 border-l-4 border-amber-600 font-bold shadow-xs"
                            : "hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-gray-800 dark:text-gray-200 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Sofa className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                          <span className="text-sm">Furniture Collection</span>
                        </div>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                          activeStore === "furniture" 
                            ? "bg-amber-600 text-white" 
                            : "bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300"
                        }`}>
                          {activeStore === "furniture" ? "Active" : "Explore"}
                        </span>
                      </button>

                      {/* Indented Sub-item: Custom Furniture Orders with seamless connecting line */}
                      <div className="ml-5 pl-3 border-l-2 border-amber-300 dark:border-amber-700/60 -mt-0.5 pt-1.5 pb-0.5">
                        <a
                          href={`https://wa.me/919148600888?text=${encodeURIComponent("Hi, I'd like to enquire about a custom furniture order.")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-lg hover:bg-amber-500/10 dark:hover:bg-amber-500/15 active:bg-amber-500/20 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                            <div className="flex flex-col text-left">
                              <span className="text-xs font-semibold leading-tight text-slate-800 dark:text-slate-200 group-hover:text-amber-950 dark:group-hover:text-amber-200">
                                Custom Furniture Orders
                              </span>
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 font-normal">
                                Custom Sizes & Wood
                              </span>
                            </div>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center gap-1 border border-emerald-200/80 dark:border-emerald-800/50">
                            <MessageCircle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            WhatsApp
                          </span>
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Customer Support & Store Info */}
                <div>
                  <h4 className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2.5 px-1">
                    Customer Support
                  </h4>
                  <div className="flex flex-col gap-1.5">
                    {/* Visit Showroom with Address Preview */}
                    <a 
                      href="https://maps.app.goo.gl/NGdyf29ia7R4Uwxn6?g_st=aw" 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-start gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-gray-800 dark:text-gray-200 transition-colors"
                    >
                      <MapPin className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                      <div className="flex flex-col text-left">
                        <span className="font-semibold text-sm">Visit Showroom</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">Kumbarakoppal, Gokulam, Mysuru</span>
                      </div>
                    </a>

                    {/* Store Hours */}
                    <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-gray-800 dark:text-gray-200 transition-colors">
                      <Clock className="w-5 h-5 text-amber-500 flex-shrink-0" />
                      <div className="flex flex-col text-left">
                        <span className="font-medium text-[11px] text-gray-500 dark:text-gray-400">Store Hours</span>
                        <span className="font-semibold text-xs text-slate-800 dark:text-slate-200">Mon – Sun: 10:00 AM – 9:00 PM</span>
                      </div>
                    </div>

                    {/* Phone Contact */}
                    <a 
                      href="tel:+919739368487"
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 active:bg-slate-200 dark:active:bg-slate-700 text-gray-800 dark:text-gray-200 font-medium transition-colors"
                    >
                      <Phone className="w-5 h-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm">+91 97393 68487</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

function Footer() {
  const pathname = usePathname();
  const isProductPage = pathname?.includes('/product/');

  return (
    <>
      {!isProductPage && (
        <>
          {/* Delivery & Service Band */}
      <section className="py-12 bg-blue-50 dark:bg-gray-900 border-y border-blue-100 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 flex-grow">
              {[
                { title: "Home Delivery", subtitle: "All over the city", icon: <Truck className="w-6 h-6 text-blue-600 dark:text-blue-400" /> },
                { title: "Home Service", subtitle: "Expert repairs", icon: <ShieldCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" /> },
                { title: "Fast Slots", subtitle: "Same or next day", icon: <Star className="w-6 h-6 text-blue-600 dark:text-blue-400" /> },
                { title: "Free Installation", subtitle: "Included on major items", icon: <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" /> }
              ].map((feature, i) => (
                <div key={i} className="flex items-center space-x-4 p-4 bg-white dark:bg-gray-950 rounded-2xl shadow-sm border border-blue-50/50 dark:border-gray-800">
                  <div className="p-3 bg-blue-50 dark:bg-gray-900 rounded-xl">{feature.icon}</div>
                  <div>
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-sm">{feature.title}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{feature.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-shrink-0">
              <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg hover:shadow-blue-500/30 transition-all transform hover:-translate-y-0.5">
                Check coverage
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white dark:bg-gray-950 border-b dark:border-gray-800 py-8">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full"><ShieldCheck className="w-6 h-6" /></div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Brand Warranty</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Official warranty on all products</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full"><Truck className="w-6 h-6" /></div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">Fast Delivery</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Safe and quick delivery to your home</p>
          </div>
          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-full"><MapPin className="w-6 h-6" /></div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">In-Store Experience</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">Visit us to see products in person</p>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-gray-50 dark:bg-gray-900 py-8 border-t border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4">
          <div className="mb-6 text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Visit Our Showroom</h2>
            <div className="w-12 h-1 bg-blue-600 mx-auto md:mx-0 mt-2 rounded-full"></div>
          </div>
          
          <div className="flex flex-col lg:flex-row bg-white dark:bg-gray-950 rounded-3xl overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 dark:border-gray-800 max-w-5xl mx-auto">
            {/* Left Info Panel */}
            <div className="lg:w-1/3 p-6 lg:p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 flex-shrink-0">
                    <MapPin className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-slate-900 dark:text-slate-100 leading-tight">Sri Sai Home</h3>
                    <span className="text-xs font-bold tracking-widest text-blue-600 dark:text-blue-400 uppercase">Main Location</span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-4 text-gray-600 dark:text-gray-400">
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-400 dark:text-gray-500 mt-0.5 border border-gray-100 dark:border-gray-800 flex-shrink-0">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Address</p>
                    <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">RAILWAY LAYOUT, Kumbarakoppal<br/>Gokulam, Mysuru, KA 570016</p>
                  </div>
                  </div>
                  
                  <div className="flex items-start gap-4 text-gray-600 dark:text-gray-400">
                    <div className="p-2 bg-gray-50 dark:bg-gray-900 rounded-lg text-gray-400 dark:text-gray-500 mt-0.5 border border-gray-100 dark:border-gray-800 flex-shrink-0">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Store Hours</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Mon-Sun, 10:00 AM - 9:00 PM</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <div className="aspect-[32/9] w-full rounded-2xl overflow-hidden mb-4 relative border border-gray-200 dark:border-gray-800">
                  <img src="/images/srisai.png" alt="Sri Sai Storefront" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/5 dark:bg-black/20 ring-1 ring-inset ring-black/10"></div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <a href="https://maps.app.goo.gl/NGdyf29ia7R4Uwxn6?g_st=aw" target="_blank" rel="noreferrer" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold transition shadow-md hover:shadow-lg active:translate-y-0">
                    Directions
                  </a>
                  <a href="tel:+919739368487" className="flex-1 bg-gray-50 dark:bg-gray-900 hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-900 dark:text-gray-100 border border-gray-200 dark:border-gray-800 flex items-center justify-center px-4 py-3 rounded-xl text-sm font-semibold transition">
                    <Phone className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" /> Call
                  </a>
                </div>
              </div>
            </div>

            {/* Right Map Panel - Static & Clickable */}
            <a 
              href="https://maps.app.goo.gl/NGdyf29ia7R4Uwxn6?g_st=aw" 
              target="_blank" 
              rel="noreferrer"
              className="lg:w-2/3 h-[250px] sm:h-[300px] lg:h-auto relative bg-gray-200 dark:bg-gray-800 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 block cursor-pointer group overflow-hidden"
            >
              {/* Click Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 dark:group-hover:bg-black/20 transition-colors z-10 flex items-center justify-center">
                <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm px-5 py-2.5 rounded-xl shadow-lg font-semibold text-gray-900 dark:text-gray-100 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 duration-200">
                  <MapPin className="w-4 h-4 text-blue-600 dark:text-blue-400" /> Open in Google Maps
                </div>
              </div>

              <iframe 
                src="https://maps.google.com/maps?q=Sri+Sai+Home+Appliances+and+Furniture,+RAILWAY+LAYOUT,+Kumbarakoppal,+Gokulam,+Mysuru,+Karnataka+570016&t=&z=15&ie=UTF8&iwloc=&output=embed" 
                width="100%" 
                height="100%" 
                style={{ border: 0 }} 
                allowFullScreen 
                loading="lazy" 
                title="Store Location"
                className="absolute inset-0 grayscale-[0.2] contrast-100 pointer-events-none"
              ></iframe>
            </a>
          </div>
        </div>
      </section>

        </>
      )}

      <footer className="bg-slate-900 text-slate-300 py-12">
        <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold text-white mb-4">Sri Sai Home Appliances</h3>
            <p className="mb-4">Your one-stop destination for premium home appliances and elegant furniture. Quality guaranteed.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/" className="hover:text-white">Home</Link></li>
              <li><Link href="/contact" className="hover:text-white">Contact Us</Link></li>
              <li>
                <a 
                  href={`https://wa.me/919148600888?text=${encodeURIComponent("Hi, I'd like to enquire about a custom furniture order.")}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="hover:text-[#25D366] transition-colors flex items-center"
                >
                  Custom Furniture Orders
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">Visit Our Store</h3>
            <a href="https://maps.app.goo.gl/NGdyf29ia7R4Uwxn6?g_st=aw" target="_blank" rel="noreferrer" className="flex items-center mb-2 hover:text-white transition-colors cursor-pointer">
              <MapPin className="w-4 h-4 mr-2" /> Our Showroom
            </a>
            <a href="tel:+919739368487" className="flex items-center mb-2 hover:text-white transition-colors"><Phone className="w-4 h-4 mr-2" /> +91 97393 68487</a>
            <a href="tel:+919148600888" className="flex items-center mb-2 hover:text-white transition-colors"><Phone className="w-4 h-4 mr-2" /> +91 91486 00888</a>
            <a href="tel:08213598113" className="flex items-center mb-2 hover:text-white transition-colors"><Phone className="w-4 h-4 mr-2" /> 08213 598113</a>
            <p className="mt-4 text-sm text-slate-400">Hours: Mon-Sun, 10:00 AM - 9:00 PM</p>
          </div>
        </div>
        <div className="container mx-auto px-4 mt-8 pt-8 border-t border-slate-800 text-center text-sm pb-24 md:pb-8">
          &copy; {new Date().getFullYear()} Sri Sai Home Appliances. All rights reserved.
        </div>
      </footer>
    </>
  )
}

import { Tracker } from "@/components/Tracker"
import { WhatsAppFloatingButton } from "@/components/WhatsAppFloatingButton"
import { AIChatFloatingButton } from "@/components/AIChatFloatingButton"

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={null}>
      <StoreProvider>
        {/* Splash screen — overlays everything on first session visit, then unmounts */}
        <SplashScreen />
        <Tracker />
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950 relative">
          <Header />
          <main className="flex-grow pt-[72px] md:pt-[80px]">
            {children}
          </main>
          <Footer />
          <AIChatFloatingButton />
          <WhatsAppFloatingButton />
        </div>
      </StoreProvider>
    </Suspense>
  )
}

