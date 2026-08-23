"use client"

import { useStore } from "@/components/StoreProvider"
import Link from "next/link"
import { ArrowRight, ShoppingBag, Truck, ShieldCheck, Star, MapPin, Utensils, Shirt, Tv, Bed, Image as ImageIcon, Flame, Sofa, Ruler, Palette, Hammer, Sparkles, Bookmark } from "lucide-react"
import FurnitureHero from "@/components/FurnitureHero"
import ApplianceHero from "@/components/ApplianceHero"
import { useScrollAnimation } from "@/hooks/useScrollAnimation"
import { CountUpStat } from "@/components/CountUpStat"

type Product = { id: string, name: string, inStock: boolean, imageUrls: string[], brand: string, categoryId: string }
type Category = { id: string, name: string }

const placeholderImages = [
  "/images/french-door.avif",
  "/images/1_a27990cd-fe5c-49da-a6b8-28a889bd348e.webp",
  "/images/WonderAmazonListing_2.webp",
  "/images/29sJDhSa_9ce89c129ea646588425ffd74d5c8bb8.webp",
  "/images/images.jpg",
  "/images/wet-and-dry-vacuum-cleaner.webp"
];

const furnitureImages = [
  "/images/1_34cdb43e-db41-4732-8f2c-60e7185a5e5e.webp",
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=500&auto=format&fit=crop",
  "/images/Wide_Walnut_Luxury_Dining_Table.webp",
  "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558997519-83ea9252edf8?q=80&w=500&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1631679706909-1844bbd07221?q=80&w=500&auto=format&fit=crop"
];

export default function HomeClient({ 
  featuredAppliances,
  bestSellerAppliances,
  newLaunchAppliances,
  featuredFurniture,
  bestSellerFurniture,
  newLaunchFurniture,
  applianceCategories,
  furnitureCategories,
  heroImages,
  brandLogos
}: { 
  featuredAppliances: Product[]
  bestSellerAppliances: Product[]
  newLaunchAppliances: Product[]
  featuredFurniture: Product[]
  bestSellerFurniture: Product[]
  newLaunchFurniture: Product[]
  applianceCategories: Category[]
  furnitureCategories: Category[]
  heroImages: { id: string, url: string, store: string }[]
  brandLogos: { id: string, name: string, url: string, store: string, order: number, size: string, invertInDark?: boolean }[]
}) {
  const { activeStore, setActiveStore } = useStore()

  const isAppliance = activeStore === "appliances"
  const categories = isAppliance ? applianceCategories : furnitureCategories

  // Attach scroll-triggered reveal observer to all .reveal* elements
  useScrollAnimation()
  
  const featuredProducts = isAppliance ? featuredAppliances : featuredFurniture
  const bestSellerProducts = isAppliance ? bestSellerAppliances : bestSellerFurniture
  const newLaunchProducts = isAppliance ? newLaunchAppliances : newLaunchFurniture
  
  const heroTheme = isAppliance 
    ? "from-blue-900 to-blue-700 text-white" 
    : "from-amber-900 to-amber-700 text-white"

  return (
    <div>
      {/* Dynamic Hero Section */}
      {isAppliance ? (
        <ApplianceHero activeStore={activeStore} images={heroImages.filter(img => img.store === "Appliances")} />
      ) : (
        <FurnitureHero />
      )}

      {/* 1. Offers Strip (Appliances Only) */}
      {isAppliance && (
        <section className="bg-blue-950 text-blue-50 py-3 overflow-hidden border-b border-blue-900">
          <div className="container mx-auto px-4 flex items-center justify-between">
            <div className="flex space-x-8 animate-pulse text-sm font-semibold tracking-wide whitespace-nowrap">
              <span>🎉 Festive Sale: Up to 40% Off</span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:inline">💳 No Cost EMI Available</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">🔄 Upgrade & Exchange Offers</span>
            </div>
            <Link href={`/${activeStore}`} className="text-sm font-bold text-blue-300 hover:text-white transition-colors underline decoration-blue-500/50 underline-offset-4 whitespace-nowrap ml-4">
              View All Offers
            </Link>
          </div>
        </section>
      )}


      {/* Expanding Category Gallery */}
      <section className="py-16 bg-gray-50 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white reveal">Shop {isAppliance ? "Appliances" : "Furniture"} by Category</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1 reveal" style={{ transitionDelay: '120ms' }}>Find exactly what you're looking for</p>
            </div>
            <Link href={`/${activeStore}`} className="text-blue-600 dark:text-blue-400 font-medium hover:underline">View All</Link>
          </div>
          
          {/* Desktop Expanding Gallery (hidden on small screens) */}
          <div className="hidden md:flex h-[450px] w-full transition-all duration-500">
            {(isAppliance ? 
              ["Refrigerators", "Washing Machines", "Mixers/Grinders", "Fans", "Air Coolers", "Vacuum Cleaners"] : 
              ["Sofas", "Beds/Cots", "Dining Tables", "Chairs", "Wardrobes", "Mattresses"]
            ).map((catName, idx) => {
              const bgClasses = [
                "bg-gradient-to-br from-slate-700 to-slate-900",
                "bg-gradient-to-br from-blue-700 to-blue-900",
                "bg-gradient-to-br from-emerald-700 to-emerald-900",
                "bg-gradient-to-br from-rose-700 to-rose-900",
                "bg-gradient-to-br from-amber-700 to-amber-900",
                "bg-gradient-to-br from-indigo-700 to-indigo-900"
              ]

              const isFirst = idx === 0;
              const clipPath = isFirst 
                ? "polygon(0 0, 100% 0, calc(100% - 15px) 100%, 0 100%)"
                : "polygon(15px 0, 100% 0, calc(100% - 15px) 100%, 0 100%)";
              const marginLeft = isFirst ? "0" : "-20px";

              return (
                <div 
                  key={idx}
                  className="group flex-1 hover:flex-[4] transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] relative hover:z-50"
                  style={{ marginLeft, zIndex: idx, filter: "drop-shadow(-8px 0px 12px rgba(0,0,0,0.4))" }}
                >
                  <div 
                    className={`relative w-full h-full overflow-hidden cursor-pointer bg-slate-900`}
                    style={{ clipPath }}
                  >
                    <div className="absolute inset-0 bg-cover bg-center opacity-60 group-hover:opacity-100 transition-opacity duration-500" style={{ backgroundImage: `url(${isAppliance ? placeholderImages[idx % placeholderImages.length] : furnitureImages[idx % furnitureImages.length]})` }} />
                    <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                      {/* Vertical Text (Visible when collapsed) */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-100 group-hover:opacity-0 transition-opacity duration-300">
                        <h3 className={`text-white/90 font-bold tracking-widest uppercase text-xl whitespace-nowrap transform -rotate-90 origin-center ${!isFirst ? "ml-4" : ""}`}>{catName}</h3>
                      </div>

                      {/* Horizontal Text & Button (Visible when expanded) */}
                      <div className={`relative z-10 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500 delay-100 flex flex-col items-start ${!isFirst ? "pl-4" : ""}`}>
                        <h3 className="text-white font-bold text-3xl mb-4">{catName}</h3>
                        <Link href={`/${activeStore}?category=${catName}`} className="inline-flex items-center text-sm font-semibold bg-white/20 hover:bg-white text-white hover:text-black backdrop-blur-md px-6 py-3 rounded-full transition-colors whitespace-nowrap">
                          Explore Collection <ArrowRight className="ml-2 w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile Horizontal Scroll Gallery */}
          <div className="md:hidden flex overflow-x-auto pb-6 -mx-4 px-4 gap-4 snap-x snap-mandatory">
            {(isAppliance ? 
              ["Refrigerators", "Washing Machines", "Mixers/Grinders", "Fans", "Air Coolers", "Vacuum Cleaners"] : 
              ["Sofas", "Beds/Cots", "Dining Tables", "Chairs", "Wardrobes", "Mattresses"]
            ).map((catName, idx) => {
              const bgClasses = [
                "bg-gradient-to-br from-slate-700 to-slate-900",
                "bg-gradient-to-br from-blue-700 to-blue-900",
                "bg-gradient-to-br from-emerald-700 to-emerald-900",
                "bg-gradient-to-br from-rose-700 to-rose-900",
                "bg-gradient-to-br from-amber-700 to-amber-900",
                "bg-gradient-to-br from-indigo-700 to-indigo-900"
              ]
              return (
                <div key={idx} className={`snap-center shrink-0 w-[85%] h-[350px] relative rounded-2xl overflow-hidden bg-slate-900`}>
                   <div className="absolute inset-0 bg-cover bg-center opacity-80" style={{ backgroundImage: `url(${isAppliance ? placeholderImages[idx % placeholderImages.length] : furnitureImages[idx % furnitureImages.length]})` }} />
                   <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/90 via-black/30 to-transparent">
                      <h3 className="text-white font-bold text-2xl mb-4">{catName}</h3>
                      <Link href={`/${activeStore}?category=${catName}`} className="inline-flex items-center text-sm font-semibold bg-white/20 text-white backdrop-blur-md px-6 py-3 rounded-full w-fit">
                        Explore Collection <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                   </div>
                </div>
              )
            })}
          </div>

        </div>
      </section>

      {/* 2. Shop by Room */}
      <section className="py-12 sm:py-16 bg-white dark:bg-slate-950 border-t dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-gray-900 dark:text-white mb-2 sm:mb-3 font-normal reveal">Shop by room</h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-2xl text-sm sm:text-lg font-light tracking-wide reveal" style={{ transitionDelay: '120ms' }}>
                {isAppliance 
                  ? "Discover the perfect appliances for every corner of your home." 
                  : "Curate your perfect living space, room by room."}
              </p>
            </div>
            <Link href={`/${activeStore}`} className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:block">View all rooms &rarr;</Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-8">
            {(isAppliance ? [
              { name: "Kitchen", desc: "Fridges, cooktops, mixers", img: "/images/kitchen.jpg", icon: <Utensils strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-500 group-hover:rotate-12" />, count: "24 items" },
              { name: "Laundry Room", desc: "Washing machines, dryers", img: "/images/laundry.jpg", icon: <Shirt strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-500 group-hover:rotate-12" />, count: "12 items" },
              { name: "Living Room", desc: "Sofas, TVs, recliners", img: "/images/living.jpg", icon: <Tv strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-500 group-hover:rotate-12" />, count: "36 items" },
              { name: "Bedroom", desc: "Beds, wardrobes, ACs", img: "/images/bed.jpg", icon: <Bed strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-500 group-hover:rotate-12" />, count: "18 items" }
            ] : [
              { name: "Living Room", desc: "Sofas, TV units, coffee tables", img: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop", icon: <Sofa strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-500 group-hover:rotate-12" />, count: "42 items" },
              { name: "Bedroom", desc: "Beds, wardrobes, dressers", img: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop", icon: <Bed strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-500 group-hover:rotate-12" />, count: "28 items" },
              { name: "Dining Room", desc: "Dining tables, chairs, sideboards", img: "https://images.unsplash.com/photo-1617806118233-18e1c0945594?q=80&w=800&auto=format&fit=crop", icon: <Utensils strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-500 group-hover:rotate-12" />, count: "15 items" },
              { name: "Study/Office", desc: "Study tables, chairs, bookshelves", img: "https://images.unsplash.com/photo-1592078615290-033ee584e267?q=80&w=800&auto=format&fit=crop", icon: <Ruler strokeWidth={1.5} className="w-4 h-4 sm:w-5 sm:h-5 text-white transition-transform duration-500 group-hover:rotate-12" />, count: "10 items" }
            ]).map((room, i) => (
              <Link key={i} href={`/${activeStore}?room=${room.name}`} className="group relative rounded-2xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 ease-out h-48 sm:h-80 hover:scale-[1.02] block reveal-scale" style={{ transitionDelay: `${i * 100}ms` }}>
                <div className="absolute inset-0 bg-slate-900">
                  <img src={room.img} alt={room.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-transform duration-700 group-hover:scale-110" />
                </div>
                {/* Grain overlay for premium texture */}
                <div className="absolute inset-0 opacity-[0.15] mix-blend-overlay" style={{backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')"}}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity duration-300"></div>
                
                <div className="relative p-4 sm:p-6 flex flex-col justify-between h-full z-10">
                  <div className="flex justify-between items-start">
                    <div className="p-2 sm:p-2.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 shadow-sm flex items-center justify-center transition-transform duration-500 group-hover:scale-105">
                      {room.icon}
                    </div>
                    <span className="text-[9px] sm:text-[10px] font-medium uppercase tracking-widest text-white/80 bg-white/10 backdrop-blur-md px-2 py-1 sm:px-3 sm:py-1.5 rounded-full border border-white/20">{room.count}</span>
                  </div>
                  
                  <div className="flex flex-col sm:transform sm:translate-y-8 group-hover:translate-y-0 transition-transform duration-300 ease-out">
                    <h3 className="text-lg sm:text-2xl font-medium text-white mb-0.5 sm:mb-1">{room.name}</h3>
                    <p className="text-white/60 text-xs sm:text-sm font-light mb-2 sm:mb-4 line-clamp-1 sm:line-clamp-none">{room.desc}</p>
                    
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75 hidden sm:flex items-center text-sm font-medium text-white/90">
                      Shop Collection <ArrowRight className="ml-2 w-4 h-4" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>



      {/* The Space Gallery */}
      {isAppliance && (
        <section className="py-24 bg-white dark:bg-slate-950 overflow-hidden border-t dark:border-slate-800">
        <div className="text-center mb-12 px-4">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-slate-900 dark:text-white mb-2 sm:mb-3 font-normal">The Space</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto text-sm sm:text-lg font-light tracking-wide">
            Experience an atmosphere designed for comfort and inspiration.
          </p>
        </div>
        
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes scroll-gallery {
            0% { transform: translateX(0); }
            100% { transform: translateX(-50%); }
          }
          .animate-scroll-gallery {
            animation: scroll-gallery 35s linear infinite;
          }
          .animate-scroll-gallery:hover {
            animation-play-state: paused;
          }
          @media (max-width: 768px) {
            .animate-scroll-gallery {
              animation-duration: 20s;
            }
          }
        `}} />
        
        <div className="w-full relative">
          <div className="flex w-max animate-scroll-gallery">
            {[1, 2].map((setIndex) => (
              <div key={setIndex} className="flex gap-3 sm:gap-4 md:gap-6 pr-3 sm:pr-4 md:pr-6">
                {[
                  { img: "/images/refride.jpg", label: "Refrigerators" },
                  { img: "/images/washing machine.jpg", label: "Washing Machines" },
                  { img: "/images/ac.jpg", label: "Air Conditioners" },
                  { img: "/images/tv.jpg", label: "Televisions" },
                  { img: "/images/micro.jpg", label: "Microwaves" },
                  { img: "/images/purifier.jpg", label: "Water Purifiers" }
                ].map((item, idx) => (
                  <div key={idx} className="w-32 sm:w-40 md:w-48 lg:w-72 aspect-[3/4] flex-shrink-0 rounded-[16px] border border-black/5 shadow-sm relative overflow-hidden group bg-slate-900">
                     <img src={item.img} alt={item.label} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-transform duration-700 group-hover:scale-110" />
                     <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-500"></div>
                     <div className="w-full h-full flex items-center justify-center text-center px-2 sm:px-4 absolute inset-0">
                       <span className="text-white font-semibold text-[10px] sm:text-xs lg:text-sm uppercase tracking-widest drop-shadow-md">{item.label}</span>
                     </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* Featured Arrivals */}
      <section className="py-12 sm:py-20 bg-[#FAFAF8] dark:bg-slate-950 border-t dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-slate-900 dark:text-white mb-2 sm:mb-3 font-normal flex items-center gap-2 sm:gap-3 reveal-left">
                <Bookmark strokeWidth={1.5} className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400" /> Featured {isAppliance ? "Arrivals" : "Pieces"}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg font-light tracking-wide reveal" style={{ transitionDelay: '150ms' }}>
                Newly added to our catalog this week
              </p>
            </div>
            <Link href={`/${activeStore}`} className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:flex items-center">
              View Full Collection <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-8 items-stretch">
            {featuredProducts.slice(0, 7).map((product, index) => (
              <Link key={product.id} href={`/product/${product.id}`} className={`group block reveal ${index === 0 ? "col-span-2 sm:col-span-2 lg:col-span-2" : ""}`} style={{ transitionDelay: `${index * 80}ms` }}>
                <div className="bg-white dark:bg-slate-900 rounded-[20px] overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.05),0_12px_32px_rgba(0,0,0,0.06)] transition-all duration-300 flex flex-col h-full border border-black/[0.03] dark:border-white/10">
                  <div className={`w-full ${index === 0 ? "aspect-square sm:aspect-[2/1]" : "aspect-square"} bg-white relative overflow-hidden flex items-center justify-center p-4 sm:p-8`}>
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <img src={product.imageUrls[0]} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                    ) : (
                      <img src={isAppliance ? placeholderImages[index % placeholderImages.length] : furnitureImages[index % furnitureImages.length]} alt={product.name} className="object-cover w-full h-full group-hover:scale-[1.03] transition-transform duration-700 ease-out" />
                    )}
                  </div>
                  <div className="p-3.5 sm:p-5 flex flex-col flex-grow">
                    {product.brand && (
                      <span className="text-[10px] font-medium tracking-widest text-slate-400 uppercase mb-1 block">
                        {product.brand}
                      </span>
                    )}
                    <h3 className="font-medium text-slate-900 dark:text-white mb-3 sm:mb-4 line-clamp-2 capitalize text-xs sm:text-base flex-grow">
                      {product.name.toLowerCase()}
                    </h3>
                    <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-slate-100 dark:border-slate-800">
                      <span className="text-[10px] sm:text-xs font-medium flex items-center text-slate-500 dark:text-slate-400">
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 sm:mr-2 ${product.inStock ? "bg-emerald-400" : "bg-rose-400"}`}></span>
                        {product.inStock ? "In stock" : "Out of stock"}
                      </span>
                      
                      <div className="flex items-center text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">
                        <span className="text-xs font-medium mr-2 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 hidden sm:inline">View</span>
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:border-slate-900 dark:group-hover:border-white transition-colors">
                          <ArrowRight strokeWidth={1.5} className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            {featuredProducts.length === 0 && (
              <div className="col-span-full py-20 text-center text-slate-400 border border-dashed border-slate-200 rounded-[20px] bg-slate-50">
                Inventory coming soon
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. Best Sellers (Both Stores) */}
      <section className="py-12 sm:py-20 bg-[#FAFAF9] dark:bg-slate-950 border-t border-stone-200 dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8 sm:mb-12">
            <div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-slate-900 dark:text-white mb-2 sm:mb-3 font-normal flex items-center gap-2 sm:gap-3 reveal-left">
                <Flame strokeWidth={1.5} className="w-7 h-7 sm:w-10 sm:h-10 text-amber-600" /> Best Sellers
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg font-light tracking-wide reveal" style={{ transitionDelay: '150ms' }}>Our most popular choices this month</p>
            </div>
            <Link href={`/${activeStore}`} className="text-slate-500 dark:text-slate-400 font-medium hover:text-slate-900 dark:hover:text-white transition-colors hidden sm:flex items-center">
              View all <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6 items-stretch">
            {bestSellerProducts.slice(0, 4).map((product, i) => (
              <Link key={product.id + '-bs'} href={`/product/${product.id}`} className="group block relative reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="bg-white dark:bg-slate-950 border border-gray-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition flex flex-col h-full">
                  <div className="w-full aspect-square bg-white relative overflow-hidden flex items-center justify-center p-4 sm:p-8 border-b border-gray-100 dark:border-slate-800">
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                       <img src={product.imageUrls[0]} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition duration-300" />
                    ) : (
                       <span className="text-gray-400 font-medium text-xs sm:text-sm">No Image</span>
                    )}
                  </div>
                  <div className="p-3.5 sm:p-6 flex flex-col flex-grow bg-white dark:bg-slate-950">
                    {product.brand && (
                      <span className="text-[10px] sm:text-[11px] font-semibold tracking-wider text-gray-400 dark:text-gray-500 uppercase mb-1">{product.brand}</span>
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-3 sm:mb-6 line-clamp-2 uppercase text-xs sm:text-lg flex-grow">{product.name}</h3>

                    <div className="flex items-center justify-between mt-auto pt-3 sm:pt-4 border-t border-gray-100 dark:border-slate-800">
                      <span className={`px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-[10px] sm:text-xs font-bold ${product.inStock ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      <span className="bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2.5 py-1 sm:px-4 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold">
                        View
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. New Launches (Both Stores) */}
      <section className="py-16 bg-white dark:bg-slate-950 border-t dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="text-2xl sm:text-4xl md:text-5xl font-serif text-slate-900 dark:text-white mb-2 sm:mb-3 font-normal flex items-center gap-2 sm:gap-3 reveal-left">
                <Sparkles strokeWidth={1.5} className="w-7 h-7 sm:w-10 sm:h-10 text-amber-400" /> New Launches
              </h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-lg font-light tracking-wide reveal" style={{ transitionDelay: '150ms' }}>
                {isAppliance ? "The latest technology, just arrived" : "The latest designs, just arrived"}
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 items-stretch">
            {newLaunchProducts.slice(0, 4).map((product, i) => (
              <Link key={product.id + '-nl'} href={`/product/${product.id}`} className="group block relative reveal" style={{ transitionDelay: `${i * 80}ms` }}>
                <div className={`absolute top-4 left-4 z-10 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md ${isAppliance ? 'bg-blue-600' : 'bg-amber-600'}`}>
                  New Arrival
                </div>
                <div className="bg-white dark:bg-slate-900 border dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col h-full transform group-hover:-translate-y-1">
                  <div className={`w-full aspect-[4/3] relative overflow-hidden flex items-center justify-center p-6 bg-white`}>
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                       <img src={product.imageUrls[0]} alt={product.name} className="object-contain w-full h-full mix-blend-multiply group-hover:scale-110 transition duration-500" />
                    ) : (
                       <img src={isAppliance ? placeholderImages[(i + 4) % placeholderImages.length] : furnitureImages[(i + 4) % furnitureImages.length]} alt={product.name} className="object-cover w-full h-full group-hover:scale-110 transition duration-500" />
                    )}
                  </div>
                  <div className="p-5 flex flex-col flex-grow border-t border-gray-50 dark:border-slate-800">
                    <span className="text-xs font-semibold tracking-wider text-gray-400 uppercase mb-1">{product.brand}</span>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 line-clamp-2 flex-grow">{product.name}</h3>
                    <div className="flex items-center justify-between mt-auto pt-4">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${product.inStock ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400" : "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400"}`}>
                        {product.inStock ? "In Stock" : "Out of Stock"}
                      </span>
                      <div className={`w-8 h-8 rounded-full bg-gray-100 dark:bg-slate-800 flex items-center justify-center group-hover:text-white dark:text-gray-300 transition-colors ${isAppliance ? 'group-hover:bg-blue-600' : 'group-hover:bg-amber-600'}`}>
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Authorised Seller Brands Grid (Only for Appliances) */}
      {isAppliance && (
        <section className="bg-slate-50 dark:bg-slate-950 py-16">
          <div className="container mx-auto px-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-10 shadow-sm">
              
              {/* Section Header */}
              <div className="flex items-center justify-center sm:justify-start mb-10 reveal">
                <h2 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase">
                  Authorised Seller of Leading Brands
                </h2>
              </div>

              {/* Logo Grid */}
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-x-8 gap-y-10 md:gap-y-12 items-center justify-items-center px-2 sm:px-6">
                {brandLogos.filter(b => b.store === "Appliances").length > 0 ? (
                  brandLogos.filter(b => b.store === "Appliances").map((brand, i) => {
                    const sizeClass = 
                      brand.size === 'small' ? 'h-6 md:h-8' :
                      brand.size === 'large' ? 'h-10 md:h-16' :
                      brand.size === 'xlarge' ? 'h-12 md:h-20' :
                      brand.size === '2xlarge' ? 'h-14 md:h-24' :
                      brand.size === '3xlarge' ? 'h-16 md:h-28' :
                      brand.size === '4xlarge' ? 'h-20 md:h-32' :
                      'h-8 md:h-12'; // medium is default
                    const invertClass = brand.invertInDark ? "dark:brightness-0 dark:invert" : "dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]";
                      
                    return (
                      <div key={brand.id} className="group flex items-center justify-center min-h-[4rem] md:min-h-[6rem] w-full transition-all duration-300 reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                        <img 
                          src={brand.url} 
                          alt={`${brand.name} logo`}
                          className={`${sizeClass} w-auto max-w-full object-contain transition-all group-hover:scale-110 duration-500 mix-blend-multiply dark:mix-blend-normal ${invertClass} opacity-90 group-hover:opacity-100`}
                        />
                      </div>
                    )
                  })
                ) : (
                  // Fallback if no brands uploaded
                  [
                    { name: "Samsung", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Samsung_Logo.svg", sizeClass: "h-9 md:h-12" },
                    { name: "LG", src: "https://commons.wikimedia.org/wiki/Special:FilePath/LG_logo_(2015).svg", sizeClass: "h-9 md:h-12" },
                    { name: "Whirlpool", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Whirlpool_Corporation_Logo_(as_of_2017).svg", sizeClass: "h-14 md:h-20" },
                    { name: "Bosch", src: "https://cdn.worldvectorlogo.com/logos/bosch.svg", sizeClass: "h-10 md:h-14" },
                    { name: "Voltas", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Voltas_logo.svg", sizeClass: "h-9 md:h-12" },
                    { name: "Haier", src: "https://cdn.worldvectorlogo.com/logos/haier.svg", sizeClass: "h-16 md:h-20 scale-125" },
                    { name: "Apple", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Apple_logo_black.svg", sizeClass: "h-9 md:h-12", invertInDark: true },
                    { name: "Dell", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Dell_logo_2016.svg", sizeClass: "h-9 md:h-12" },
                    { name: "ASUS", src: "https://commons.wikimedia.org/wiki/Special:FilePath/ASUS_Logo.svg", sizeClass: "h-8 md:h-10", invertInDark: true },
                    { name: "Sony", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Sony_logo.svg", sizeClass: "h-8 md:h-10", invertInDark: true },
                    { name: "Philips", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Philips_logo_new.svg", sizeClass: "h-9 md:h-12" },
                    { name: "Panasonic", src: "https://commons.wikimedia.org/wiki/Special:FilePath/Panasonic_logo.svg", sizeClass: "h-7 md:h-9", invertInDark: true }
                  ].map((brand, i) => {
                    const invertClass = brand.invertInDark ? "dark:brightness-0 dark:invert" : "dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]";
                    return (
                      <div key={brand.name} className="group flex items-center justify-center min-h-[4rem] md:min-h-[6rem] w-full transition-all duration-300 reveal" style={{ transitionDelay: `${i * 60}ms` }}>
                        <img 
                          src={brand.src} 
                          alt={`${brand.name} logo`}
                          className={`${brand.sizeClass || 'h-8 md:h-12'} w-auto max-w-full object-contain transition-all group-hover:scale-110 duration-500 mix-blend-multiply dark:mix-blend-normal ${invertClass} opacity-90 group-hover:opacity-100`}
                        />
                      </div>
                    )
                  })
                )}
              </div>

            </div>
          </div>
        </section>
      )}

      {/* 6. Brand Spotlight Banner (Appliances Only) */}
      {isAppliance && (
        <section className="py-20 bg-slate-950 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-blue-900/40 to-transparent"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl"></div>
          
          <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6 reveal-left">
              <div className="inline-block bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20">
                <span className="text-xs font-bold tracking-widest uppercase text-blue-300">Brand Spotlight of the Month</span>
              </div>
              <h2 className="text-4xl md:text-6xl font-black tracking-tight">SAMSUNG</h2>
              <p className="text-xl text-gray-300 max-w-lg leading-relaxed">
                Experience the next generation of smart living. Up to 25% off on select BESPOKE refrigerators and AI-powered washing machines.
              </p>
              <div className="pt-4 flex gap-4">
                <Link href={`/${activeStore}?search=samsung`} className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-colors text-center inline-block">
                  Shop Samsung
                </Link>
                <Link href={`/${activeStore}`} className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white font-bold rounded-full hover:bg-white/20 transition-colors text-center inline-block">
                  View Offers
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 w-full bg-white/5 border border-white/10 rounded-3xl overflow-hidden relative group reveal-right" style={{ transitionDelay: '200ms' }}>
              <img src="/images/samsung.jpg" alt="Samsung Showcase" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-700" />
            </div>
          </div>
        </section>
      )}

      {/* Custom Furniture Banner (Furniture Only) */}
      {!isAppliance && (
        <section className="py-20 bg-[#FAFAF9] dark:bg-slate-950 border-t border-b border-slate-200 dark:border-slate-800">
          <div className="container mx-auto px-4 relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2 space-y-6">
              <div className="inline-flex items-center bg-amber-100/60 dark:bg-amber-900/30 border border-amber-200/60 dark:border-amber-800/50 text-amber-900 dark:text-amber-400 text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm">
                Bespoke Services
              </div>
              <h2 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 dark:text-slate-100 tracking-tight" style={{ fontFamily: 'var(--font-cormorant)' }}>
                Customize Your Furniture
              </h2>
              <p className="text-lg text-slate-600 dark:text-slate-400 max-w-lg leading-relaxed font-light">
                Can't find the perfect fit? We craft bespoke pieces tailored exactly to your space. Choose your own dimensions, fabrics, and finishes to create something uniquely yours.
              </p>
              <ul className="space-y-4 py-4">
                <li className="flex items-start text-slate-700 dark:text-slate-300">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg mr-4 mt-0.5 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Ruler className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-900 dark:text-slate-100 mb-0.5">Custom Dimensions</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Tailored to fit your floorplan perfectly</span>
                  </div>
                </li>
                <li className="flex items-start text-slate-700 dark:text-slate-300">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg mr-4 mt-0.5 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Palette className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-900 dark:text-slate-100 mb-0.5">Premium Materials</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Extensive fabric & genuine leather options</span>
                  </div>
                </li>
                <li className="flex items-start text-slate-700 dark:text-slate-300">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-lg mr-4 mt-0.5 border border-slate-200 dark:border-slate-800 shadow-sm">
                    <Hammer className="w-5 h-5 text-slate-800 dark:text-slate-200" />
                  </div>
                  <div>
                    <span className="block font-semibold text-slate-900 dark:text-slate-100 mb-0.5">Choice of Finishes</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400">Select your preferred wood grains & leg styles</span>
                  </div>
                </li>
              </ul>
              
              <div className="flex items-center gap-3 text-sm text-slate-700 dark:text-slate-300 font-medium tracking-wide my-2 bg-white dark:bg-slate-900 px-5 py-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm w-fit">
                <span>1. Share ideas</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                <span>2. Get quote</span>
                <ArrowRight className="w-3.5 h-3.5 text-amber-600 dark:text-amber-500" />
                <span>3. We craft it</span>
              </div>

              <div className="pt-2">
                <div className="flex flex-wrap items-center gap-6">
                  <a 
                    href={`https://wa.me/919148600888?text=${encodeURIComponent("Hi, I'd like to request a custom furniture quote. Here's what I'm looking for:\n- Piece type: \n- Approx dimensions: \n- Fabric/wood preference: ")}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center px-8 py-4 rounded-full font-bold shadow-xl bg-[#25D366] text-white hover:bg-[#20bd59] transition-all hover:scale-105 group"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="w-5 h-5 mr-3"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                    </svg>
                    Request Custom Quote
                  </a>
                  <button className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-sm font-semibold underline underline-offset-4 transition-colors">
                    View past custom work
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-500 mt-4">Free consultation, no obligation.</p>
              </div>
            </div>
            <div className="md:w-1/2 w-full flex justify-end mt-8 md:mt-0">
              <div className="relative w-full max-w-md aspect-[4/5] rounded-[2rem] overflow-hidden shadow-2xl">
                <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800&auto=format&fit=crop" alt="Bespoke Furniture Piece" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-8 left-8 right-8">
                  <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-5 text-white shadow-lg">
                    <p className="font-serif italic text-lg mb-2 leading-snug">"500+ custom pieces delivered across the city since 2015."</p>
                    <p className="text-xs uppercase tracking-widest text-[#D9B96E] font-bold">Trusted Craftsmanship</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Shop With Us / Store Info (Shared) */}
      <section className="py-20 bg-gray-50 dark:bg-slate-950 border-t dark:border-slate-800">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
            <div className="lg:w-1/2 space-y-6 reveal-left">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">Why Shop With Us?</h2>
              <div className={`w-20 h-1 rounded ${isAppliance ? 'bg-blue-600' : 'bg-amber-600'}`}></div>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                For years, Sri Sai Home Appliances has been a trusted name for families across our city looking for quality home appliances and furniture under one roof. We work directly with leading brands to bring you genuine products backed by official warranty, and our team is always on hand to help you choose the right fit for your home and budget.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                Visit our showroom to see, touch, and compare products in person before you buy — because some decisions are easier made face-to-face.
              </p>
            </div>
            <div className="lg:w-1/2 w-full reveal-right" style={{ transitionDelay: '150ms' }}>
              {/* Store Photo Placeholder */}
              <div className="aspect-video bg-gray-200 rounded-2xl border-4 border-white shadow-xl flex items-center justify-center overflow-hidden relative group cursor-pointer">
                 <img src="/images/srisai.png" alt="Sri Sai Home Appliances Storefront" className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                 <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. By the Numbers (Appliances Only) */}
      {isAppliance && (
        <section className="py-16 bg-white dark:bg-slate-950 border-t dark:border-slate-800">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-gray-100 dark:divide-slate-800">
              <CountUpStat value={15}  suffix="+"  label="Years in Business" delay={0}   />
              <CountUpStat value={50}  suffix="k+" label="Happy Families"     delay={100} />
              <CountUpStat value={20}  suffix="+"  label="Top Brands"         delay={200} />
              <CountUpStat value={100} suffix="%"  label="Genuine Products"   delay={300} />
            </div>
          </div>
        </section>
      )}

      {/* 8. Furniture Spotlight (Appliances Only - Cross Promotion) */}
      {isAppliance && (
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-slate-950 border-t dark:border-slate-800">
          <div className="container mx-auto px-4 md:px-8">
            <div className="bg-gradient-to-br from-stone-950 via-[#4A2612] to-amber-700 rounded-2xl shadow-2xl flex flex-col md:flex-row relative overflow-hidden">
              
              {/* Optional Radial Glow */}
              <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-amber-500/15 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none mix-blend-screen"></div>

              {/* Text Side */}
              <div className="md:w-1/2 p-10 md:p-14 lg:p-20 text-white space-y-6 z-10 flex flex-col justify-center reveal-left">
                <div>
                  <span className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-amber-50 text-[10px] sm:text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm">
                    Explore Sri Sai Furniture
                  </span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-serif font-semibold text-white tracking-tight leading-tight">
                  Looking to furnish your space?
                </h2>
                <p className="text-amber-100/80 text-lg leading-relaxed max-w-md">
                  We don't just upgrade your appliances — we can furnish your entire home. Discover sofas, dining sets, and beds right next door.
                </p>
                  <button 
                    onClick={() => {
                      setActiveStore("furniture");
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group inline-flex items-center mt-6 bg-white text-amber-950 font-bold px-8 py-4 rounded-full hover:bg-amber-50 transition-all hover:scale-[1.02] shadow-xl border-2 border-transparent hover:border-amber-200"
                  >
                    Browse Furniture <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
              </div>

              {/* Image Side (Editorial Docked Layout) */}
              <div className="md:w-1/2 w-full min-h-[300px] md:min-h-[400px] pt-4 px-4 pb-4 md:pt-6 md:pl-6 md:pr-0 md:pb-0 z-10 flex reveal-right" style={{ transitionDelay: '200ms' }}>
                <div className="w-full h-full bg-black/20 rounded-2xl md:rounded-none md:rounded-tl-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] border border-white/10 md:border-b-0 md:border-r-0 relative flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent"></div>
                  <Sofa className="w-16 h-16 text-amber-100/30 mb-4 z-10" strokeWidth={1} />
                  <span className="text-amber-100/40 text-sm font-semibold uppercase tracking-[0.2em] z-10">Premium Furniture Vignette</span>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}

      {/* Appliances Spotlight (Furniture Only - Cross Promotion) */}
      {!isAppliance && (
        <section className="py-16 md:py-24 bg-gray-50 dark:bg-slate-950 border-t dark:border-slate-800">
          <div className="container mx-auto px-4 md:px-8">
            <div className="bg-gradient-to-br from-slate-950 via-[#1E3A8A] to-blue-700 rounded-2xl shadow-2xl flex flex-col md:flex-row relative overflow-hidden">
              
              {/* Optional Radial Glow */}
              <div className="absolute top-0 left-0 w-[800px] h-[800px] bg-blue-500/15 rounded-full blur-[120px] -translate-x-1/3 -translate-y-1/3 pointer-events-none mix-blend-screen"></div>

              {/* Text Side */}
              <div className="md:w-1/2 p-10 md:p-14 lg:p-20 text-white space-y-6 z-10 flex flex-col justify-center reveal-left">
                <div>
                  <span className="inline-flex items-center bg-white/10 backdrop-blur-md border border-white/20 text-blue-50 text-[10px] sm:text-xs font-bold tracking-widest uppercase px-4 py-1.5 rounded-full shadow-sm">
                    Explore Sri Sai Home Appliances
                  </span>
                </div>
                <h2 className="text-3xl lg:text-5xl font-serif font-semibold text-white tracking-tight leading-tight">
                  Need to upgrade your appliances?
                </h2>
                <p className="text-blue-100/80 text-lg leading-relaxed max-w-md">
                  We don't just furnish your home — we can upgrade it. Discover refrigerators, washing machines, and TVs right next door.
                </p>
                  <button 
                    onClick={() => {
                      setActiveStore("appliances");
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="group inline-flex items-center mt-6 bg-white text-slate-950 font-bold px-8 py-4 rounded-full hover:bg-blue-50 transition-all hover:scale-[1.02] shadow-xl border-2 border-transparent hover:border-blue-200"
                  >
                    Browse Appliances <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </button>
              </div>

              {/* Image Side (Editorial Docked Layout) */}
              <div className="md:w-1/2 w-full min-h-[300px] md:min-h-[400px] pt-4 px-4 pb-4 md:pt-6 md:pl-6 md:pr-0 md:pb-0 z-10 flex reveal-right" style={{ transitionDelay: '200ms' }}>
                <div className="w-full h-full bg-black/20 rounded-2xl md:rounded-none md:rounded-tl-2xl shadow-[inset_0_0_80px_rgba(0,0,0,0.6)] border border-white/10 md:border-b-0 md:border-r-0 relative flex flex-col items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-black/40 to-transparent"></div>
                  <Tv className="w-16 h-16 text-blue-100/30 mb-4 z-10" strokeWidth={1} />
                  <span className="text-blue-100/40 text-sm font-semibold uppercase tracking-[0.2em] z-10 text-center">Premium Appliance Showcase</span>
                </div>
              </div>

            </div>
          </div>
        </section>
      )}




      {/* 10. FAQ Accordion (Appliances Only) */}
      {isAppliance && (
        <section className="py-20 bg-gray-50 dark:bg-slate-950 border-t dark:border-slate-800">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Frequently Asked Questions</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">Everything you need to know about buying from us.</p>
            </div>
            <div className="space-y-4">
              {[
                { q: "How does the brand warranty work?", a: "All products come with an official manufacturer's warranty. If you face any issues, you can either contact the brand's service center directly or call us—we'll help raise a service ticket for you." },
                { q: "What areas do you deliver to?", a: "We offer home delivery across the entire city and surrounding suburbs. Delivery times are usually within 24-48 hours depending on stock availability." },
                { q: "Are there any EMI options available?", a: "Yes! We offer flexible No Cost EMI options via major credit cards, Bajaj Finserv, and other local financing partners right at the store." },
                { q: "Is installation free?", a: "Standard installation is completely free for major appliances like ACs, Washing Machines, and TVs, provided by the brand's authorized technicians." },
                { q: "What is your return policy?", a: "We accept returns or replacements within 7 days of delivery only in the case of manufacturing defects or transit damage. Please inspect your product upon delivery." }
              ].map((faq, i) => (
                <details key={i} className="group bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-2xl open:shadow-md transition-all duration-300">
                  <summary className="flex items-center justify-between cursor-pointer p-6 font-bold text-gray-900 dark:text-white marker:content-none">
                    {faq.q}
                    <span className="transition group-open:rotate-180">
                      <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                    </span>
                  </summary>
                  <div className="px-6 pb-6 text-gray-600 dark:text-gray-400 leading-relaxed border-t border-gray-100 dark:border-slate-800 pt-4 mt-2">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 11. WhatsApp / Newsletter (Appliances Only) */}
      {isAppliance && (
        <section style={{ background: "linear-gradient(135deg, #0B8A3E, #12A94D)" }} className="py-14">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-3" style={{ color: "#FFFFFF" }}>Stay Connected With Us!</h2>
            <p className="mb-10 max-w-xl mx-auto" style={{ color: "rgba(255,255,255,0.85)" }}>Scan the QR codes below to follow us on WhatsApp &amp; Instagram for exclusive deals, new arrivals, and more.</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              {/* WhatsApp QR */}
              <a href="https://whatsapp.com/channel/0029Vb95MeXF6sn1FE4zz03N" target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center w-56 hover:scale-105 transition-transform cursor-pointer rounded-2xl p-6"
                style={{ background: "#FFFFFF", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", borderRadius: "20px" }}>
                <img src="/images/qr-whatsapp.png" alt="WhatsApp Channel QR Code" className="w-40 h-40 object-contain rounded-xl" />
                <p className="mt-3 text-sm font-semibold flex items-center gap-2" style={{ color: "#2D3142" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#25D366", display: "inline-block", flexShrink: 0 }}></span>
                  WhatsApp Channel
                </p>
              </a>
              {/* Instagram QR */}
              <a href="https://www.instagram.com/srisaihomeappfurnitures?utm_source=qr&igsi=ajB5em5ocmx2a3Rq" target="_blank" rel="noopener noreferrer"
                className="flex flex-col items-center w-56 hover:scale-105 transition-transform cursor-pointer"
                style={{ background: "#FFFFFF", boxShadow: "0 8px 24px rgba(0,0,0,0.15)", borderRadius: "20px", padding: "24px" }}>
                <img src="/images/qr-instagram.png" alt="Instagram QR Code" className="w-40 h-40 object-contain rounded-xl" />
                <p className="mt-3 text-sm font-semibold flex items-center gap-2" style={{ color: "#2D3142" }}>
                  <span style={{ width: 9, height: 9, borderRadius: "50%", background: "#E63E7A", display: "inline-block", flexShrink: 0 }}></span>
                  @srisaihomeappfurnitures
                </p>
              </a>
            </div>
          </div>
        </section>
      )}



    </div>
  )
}
