"use client"
import { useEffect, useRef, useState } from "react"

interface CountUpStatProps {
  /** The final number to count up to */
  value: number
  /** Appended after the number, e.g. "+" or "k+" or "%" */
  suffix?: string
  /** Label shown below the number */
  label: string
  /** Animation start delay in ms (for staggering multiple stats) */
  delay?: number
}

/**
 * Animated counter stat card.
 * - Counts from 0 → value using ease-out cubic over ~1.4s
 * - Triggers on viewport entry via its own IntersectionObserver
 * - Has `reveal` class so the card also fades in on scroll (coordinated with useScrollAnimation)
 * - Shows final value immediately if prefers-reduced-motion is set
 */
export function CountUpStat({ value, suffix = "", label, delay = 0 }: CountUpStatProps) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setCount(value)
      return
    }

    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasStarted) {
          setHasStarted(true)
          observer.unobserve(el)

          const duration = 1400 // ms
          const start = performance.now()

          const animate = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            // Ease-out cubic: fast start, smooth deceleration
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.round(eased * value))
            if (progress < 1) requestAnimationFrame(animate)
          }

          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.3 } // Higher threshold — want user to clearly see the stats before counting starts
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, hasStarted])

  return (
    <div
      ref={ref}
      className="text-center px-4 reveal"
      style={{ transitionDelay: `${delay}ms` }}
    >
      <h3 className="text-4xl md:text-5xl font-black text-blue-600 mb-2 tabular-nums">
        {count}{suffix}
      </h3>
      <p className="text-sm font-bold tracking-widest text-gray-400 uppercase">
        {label}
      </p>
    </div>
  )
}
