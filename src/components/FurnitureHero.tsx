"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";

const clamp = (val: number, min: number, max: number) => Math.max(min, Math.min(max, val));

type LayoutPreset = 'left' | 'center' | 'bottom-center' | 'right' | 'right-left';

interface StoryScene {
  category: string;
  id: string;
  start: number;
  end: number;
  layout: LayoutPreset;
  title: string;
  titleSizeClass: string;
  eyebrow: string;
  headingTop: string;
  headingBottom: string;
  description: string[];
}

const storyScenes: StoryScene[] = [
  { 
    category: "Furniture",
    id: "sofas", 
    start: 0.15, end: 0.33, 
    layout: "right",
    eyebrow: "✦ SIGNATURE COLLECTION",
    title: "SOFAS", 
    titleSizeClass: "text-[clamp(4rem,8vw,7.5rem)]",
    headingTop: "DESIGNED FOR",
    headingBottom: "EVERYDAY COMFORT.",
    description: [
      "Crafted with refined materials,",
      "designed for lasting comfort."
    ]
  },
  { 
    category: "Furniture",
    id: "dining", 
    start: 0.33, end: 0.48, 
    layout: "left",
    eyebrow: "✦ DINING COLLECTION",
    title: "DINING", 
    titleSizeClass: "text-[clamp(4rem,7.5vw,6.5rem)]",
    headingTop: "MADE FOR",
    headingBottom: "GATHERING TOGETHER.",
    description: [
      "Elegant dining spaces,",
      "where every meal becomes a memory."
    ]
  },
  { 
    category: "Furniture",
    id: "entertainment", 
    start: 0.48, end: 0.60,
    layout: "right",
    eyebrow: "✦ ENTERTAINMENT",
    title: "TV UNIT", 
    titleSizeClass: "text-[clamp(4rem,7.5vw,6.5rem)]",
    headingTop: "DESIGNED TO",
    headingBottom: "FRAME EVERY MOMENT.",
    description: [
      "Clean lines and refined storage,",
      "crafted for modern entertainment."
    ]
  },
  { 
    category: "Furniture",
    id: "coffee-table", 
    start: 0.60, end: 0.70, 
    layout: "left",
    eyebrow: "✦ ACCENTS",
    title: "COFFEE TABLE", 
    titleSizeClass: "text-[clamp(3.5rem,6.5vw,5.5rem)]",
    headingTop: "THE PERFECT",
    headingBottom: "CENTERPIECE.",
    description: [
      "Thoughtfully designed details,",
      "bringing balance to every room."
    ]
  },
  { 
    category: "Furniture",
    id: "bedroom", 
    start: 0.70, end: 0.80, 
    layout: "right",
    eyebrow: "✦ SANCTUARY",
    title: "BEDROOM", 
    titleSizeClass: "text-[clamp(4rem,7vw,6rem)]",
    headingTop: "CREATED FOR",
    headingBottom: "RESTFUL NIGHTS.",
    description: [
      "Timeless craftsmanship,",
      "for comfort that lasts beyond tomorrow."
    ]
  }
];

export default function FurnitureHero() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  
  // Layer Refs
  const heroLayerRef = useRef<HTMLDivElement>(null);
  const scenesContainerRef = useRef<HTMLDivElement>(null);
  const finalLayerRef = useRef<HTMLDivElement>(null);

  // Individual Scene Refs
  const sceneRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Final Beat Refs
  const b1Ref = useRef<HTMLSpanElement>(null);
  const b2Ref = useRef<HTMLSpanElement>(null);
  const b3Ref = useRef<HTMLSpanElement>(null);
  const b4Ref = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    // 1. Eagerly preload all 245 images
    const totalFrames = 245;
    for (let i = 1; i <= totalFrames; i++) {
      const img = new Image();
      const paddedNumber = i.toString().padStart(3, '0');
      img.src = `/furniture-sequence/ezgif-frame-${paddedNumber}.jpg`;
      imagesRef.current.push(img);
    }

    let animationFrameId: number;

    const resizeCanvas = (canvas: HTMLCanvasElement) => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
      }
    };

    const drawImageCover = (ctx: CanvasRenderingContext2D, img: HTMLImageElement, canvas: HTMLCanvasElement) => {
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.height;
      let offsetX = 0;
      let offsetY = 0;

      if (imgRatio > canvasRatio) {
        drawWidth = canvas.height * imgRatio;
        offsetX = (canvas.width - drawWidth) / 2;
      } else {
        drawHeight = canvas.width / imgRatio;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    };

    const applyCinematicStagger = (container: HTMLElement, sceneP: number) => {
      const children = Array.from(container.children) as HTMLElement[];
      const offsets = [0, 0.15, 0.3, 0.45, 0.6, 0.75]; // Stagger multipliers for entrance
      
      if (sceneP <= 0 || sceneP >= 1) {
        container.style.opacity = '0';
        container.style.visibility = 'hidden';
        return;
      }
      
      container.style.opacity = '1';
      container.style.visibility = 'visible';

      children.forEach((child, idx) => {
        const offset = offsets[Math.min(idx, offsets.length - 1)];
        // Map 0 -> 0.25 window to individual staggered entrance bounds
        const childStart = offset * 0.15; // 0 to 0.1125
        const childEnd = childStart + 0.1; // 0.1 to 0.2125
        
        let opacity = 0, blur = 8, translateY = 24;

        if (sceneP < 0.25) {
          const p = clamp((sceneP - childStart) / (childEnd - childStart), 0, 1);
          const easeP = 1 - Math.pow(1 - p, 3); // Cubic ease out
          opacity = easeP;
          blur = 8 * (1 - easeP);
          translateY = 24 * (1 - easeP);
        } else if (sceneP < 0.8) {
          opacity = 1; blur = 0; translateY = 0;
        } else {
          // Exit uniformly
          const p = (sceneP - 0.8) / 0.2;
          opacity = 1 - p;
          blur = 8 * p;
          translateY = -24 * p;
        }

        child.style.opacity = opacity.toString();
        child.style.filter = `blur(${blur}px)`;
        child.style.transform = `translateY(${translateY}px)`;
      });
    };

    const applyEntranceBeat = (ref: HTMLElement | null, progress: number, start: number, duration: number) => {
      if (!ref) return;
      const p = clamp((progress - start) / duration, 0, 1);
      const easeP = 1 - Math.pow(1 - p, 3); // Cubic ease out
      ref.style.opacity = easeP.toString();
      ref.style.filter = `blur(${8 * (1 - easeP)}px)`;
      ref.style.transform = `translateY(${24 * (1 - easeP)}px)`;
    };

    const renderFrame = (progress: number) => {
      // 1. Draw Canvas
      if (canvasRef.current && imagesRef.current.length > 0) {
        const frameIndex = Math.min(totalFrames - 1, Math.floor(progress * totalFrames));
        const currentImg = imagesRef.current[frameIndex];
        
        if (currentImg && currentImg.complete && currentImg.naturalWidth) {
          const canvas = canvasRef.current;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            resizeCanvas(canvas);
            drawImageCover(ctx, currentImg, canvas);
          }
        }
      }

      // 2. Hero Fade (0 -> 0.15)
      if (heroLayerRef.current) {
        const localP = clamp(progress / 0.15, 0, 1);
        
        if (localP >= 1) {
          heroLayerRef.current.style.visibility = 'hidden';
        } else {
          heroLayerRef.current.style.visibility = 'visible';
          heroLayerRef.current.style.opacity = (1 - localP).toString();
          heroLayerRef.current.style.transform = `translateY(${-30 * localP}px) scale(${1 - (0.03 * localP)})`;
          heroLayerRef.current.style.filter = `blur(${6 * localP}px)`;
        }
      }

      // 3. Story Scenes (0.15 -> 0.80)
      storyScenes.forEach((scene, index) => {
        const el = sceneRefs.current[index];
        if (el) {
          const sceneP = clamp((progress - scene.start) / (scene.end - scene.start), 0, 1);
          applyCinematicStagger(el, sceneP);
        }
      });

      // 4. Final CTA Reveal (0.80 -> 1.0)
      if (finalLayerRef.current) {
        if (progress > 0.79) {
          finalLayerRef.current.style.visibility = 'visible';
          applyEntranceBeat(b1Ref.current, progress, 0.80, 0.03); 
          applyEntranceBeat(b2Ref.current, progress, 0.83, 0.03); 
          applyEntranceBeat(b3Ref.current, progress, 0.86, 0.03); 
          applyEntranceBeat(b4Ref.current, progress, 0.90, 0.05); 
          applyEntranceBeat(ctaRef.current, progress, 0.95, 0.05); 
        } else {
          finalLayerRef.current.style.visibility = 'hidden';
        }
      }
    };

    const onScroll = () => {
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const scrollDistance = rect.height - window.innerHeight;
      const scrolled = -rect.top;
      const progress = clamp(scrolled / scrollDistance, 0, 1);
      renderFrame(progress);
    };

    const handleScroll = () => {
      animationFrameId = requestAnimationFrame(onScroll);
    };

    if (imagesRef.current[0]) {
      imagesRef.current[0].onload = () => {
        handleScroll();
      };
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const getLayoutClasses = (layout: LayoutPreset) => {
    switch(layout) {
      case 'left': return 'items-start text-left mr-auto pl-4 md:pl-8';
      case 'center': return 'items-start text-left mx-auto'; // Changed to items-start for left edge alignment
      case 'bottom-center': return 'items-start text-left mx-auto'; // Changed to items-start for left edge alignment
      case 'right': return 'items-end text-right ml-auto pr-4 md:pr-8'; // Restored right-alignment for right-side scenes
      case 'right-left': return 'items-start text-left ml-auto pr-4 md:pr-8 lg:pr-16'; // Right anchored, left aligned text
      default: return 'items-start text-left mx-auto';
    }
  };

  return (
    <section ref={sectionRef} className="relative w-full h-[500vh] bg-[#1a0f08]">
      <div className="sticky top-0 w-full h-screen overflow-hidden text-white flex flex-col justify-center">
        
        {/* Canvas Background Layer */}
        <div className="absolute inset-0 w-full h-full z-0 overflow-hidden bg-[#241308]">
          <canvas ref={canvasRef} className="w-full h-full block" />
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 25%, rgba(0,0,0,0.0) 55%)'
            }}
          ></div>
        </div>

        {/* Phase 1: Base Hero */}
        <div 
          ref={heroLayerRef} 
          className="absolute inset-0 z-10 flex flex-col justify-center w-full pointer-events-auto"
        >
          <div className="container mx-auto px-4">
            <div className="md:w-3/5 lg:w-2/3 max-w-3xl pl-4 md:pl-8">
              <div>
                <span className="block font-semibold tracking-widest uppercase text-sm text-amber-500">
                  SRI SAI FURNITURE
                </span>
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mt-6" style={{ fontFamily: 'var(--font-cormorant)' }}>
                <span className="block mb-2">Furnish Your Home with</span>
                <span className="block text-[#D9B96E]">Timeless Comfort</span>
              </h1>
              <div className="text-lg md:text-xl opacity-90 max-w-lg leading-relaxed mt-6">
                <span className="block pb-1">Explore our handpicked collection of</span>
                <span className="block pb-1">sofas, beds, and dining sets</span>
                <span className="block text-[#D9B96E] font-medium">built to last.</span>
              </div>
              <div className="mt-8 flex flex-wrap gap-4">
                <Link href="/furniture" className="inline-flex items-center px-8 py-4 rounded-full font-bold shadow-lg bg-white text-amber-900 hover:bg-amber-50 group">
                  Browse Furniture <ArrowRight className="ml-3 w-5 h-5" />
                </Link>
                <a 
                  href={`https://wa.me/919148600888?text=${encodeURIComponent("Hi, I'd like to enquire about a custom furniture order.")}`} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center px-8 py-4 rounded-full font-bold shadow-lg bg-[#25D366] text-white hover:bg-[#20bd59] transition-all group"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="w-5 h-5 mr-3"
                  >
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
                  </svg>
                  Custom Orders
                </a>
              </div>
            </div>
          </div>
        </div>
        
        {/* Phase 2: Cinematic Story Scenes */}
        <div ref={scenesContainerRef} className="absolute inset-0 z-20 pointer-events-none">
          {storyScenes.map((scene, i) => {
            const isBottom = scene.layout === 'bottom-center';
            return (
              <div 
                key={scene.id}
                className={`absolute inset-0 w-full h-full flex flex-col ${isBottom ? 'justify-end pb-32 md:pb-48' : 'justify-center'} pointer-events-none`}
              >
                <div className="container mx-auto px-4 w-full flex">
                  <div 
                    ref={el => { sceneRefs.current[i] = el; }}
                    className={`w-full max-w-[440px] flex flex-col opacity-0 ${getLayoutClasses(scene.layout)}`}
                  >
                    {/* Element 0: Eyebrow */}
                    <div className="flex items-center text-[#D9B96E] text-[14px] tracking-[0.4em] font-semibold mb-5 uppercase whitespace-nowrap">
                      {scene.eyebrow}
                    </div>
                    {/* Element 1: Title */}
                    <h2 
                      className={`font-semibold text-[#F8F6F2] leading-none mb-6 tracking-tight ${scene.titleSizeClass}`}
                      style={{ fontFamily: 'var(--font-cormorant)', textShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
                    >
                      {scene.title}
                    </h2>
                    {/* Element 2: Top Heading */}
                    <div className="text-[20px] md:text-[26px] font-normal tracking-[0.3em] text-[#F8F6F2] leading-tight uppercase mb-1">
                      {scene.headingTop}
                    </div>
                    {/* Element 3: Bottom Heading */}
                    <div className="text-[32px] md:text-[48px] font-bold text-[#D9B96E] leading-tight mb-8 uppercase whitespace-normal md:whitespace-nowrap">
                      {scene.headingBottom}
                    </div>
                    {/* Element 4: Divider */}
                    <div className="text-[rgba(217,185,110,0.45)] mb-8 tracking-widest text-xl whitespace-nowrap w-[80px] overflow-hidden">
                      ──────── ✦
                    </div>
                    {/* Element 5: Description */}
                    <div className="text-[18px] text-[rgba(255,255,255,0.82)] leading-relaxed whitespace-normal md:whitespace-nowrap">
                      {scene.description.join(' ')}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Phase 3: Final Reveal & CTA */}
        <div ref={finalLayerRef} className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center opacity-100 visibility-hidden px-4 pointer-events-auto">
          <div 
            className="text-4xl md:text-5xl lg:text-7xl font-semibold tracking-wide text-[#F8F6F2] mb-8 space-y-4 uppercase" 
            style={{ fontFamily: 'var(--font-cormorant)', textShadow: '0 2px 12px rgba(0,0,0,0.18)' }}
          >
            <span ref={b1Ref} className="block opacity-0">Every room.</span>
            <span ref={b2Ref} className="block opacity-0">Every detail.</span>
            <span ref={b3Ref} className="block opacity-0">One destination.</span>
          </div>
          
          <div ref={b4Ref} className="opacity-0 mb-12 mt-6">
            <p className="text-xl md:text-2xl text-[rgba(255,255,255,0.82)] font-light tracking-wide leading-relaxed">
              Discover furniture designed<br />to feel like home.
            </p>
          </div>

          <Link 
            ref={ctaRef}
            href="/furniture" 
            className="opacity-0 inline-flex items-center px-10 py-5 rounded-full text-lg font-bold shadow-2xl bg-[#D9B96E] text-[#1a0f08] hover:bg-[#c2a35b] transition-all hover:scale-105"
          >
            Explore Collection <ArrowRight className="ml-3 w-6 h-6" />
          </Link>
        </div>

      </div>
    </section>
  );
}
