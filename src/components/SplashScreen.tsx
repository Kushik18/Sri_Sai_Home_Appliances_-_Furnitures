"use client"

import { useEffect, useState, useCallback } from "react"

const SPLASH_KEY = "srisai_splash_shown"

// Total time before auto-exit begins (ms)
// logo 0.7s + title 0.55s delay 0.7s + line delay 1.0s + subtitle delay 1.15s + hold = 2800
const SPLASH_DURATION = 2800
// Must match .splash-exit CSS duration (0.55s)
const EXIT_DURATION = 550

export default function SplashScreen() {
  /**
   * CRITICAL FIX for hydration glitch:
   * show starts TRUE — the white overlay covers the page from the very first SSR/client render.
   * This prevents the site ever being visible before the splash.
   * useEffect then decides:
   *   - already seen session  → setShow(false) immediately (instant dismiss, no flash)
   *   - reduced-motion pref   → setShow(false) immediately
   *   - first time this session → setAnimating(true) to kick off CSS animations
   */
  const [show, setShow] = useState(true)
  const [animating, setAnimating] = useState(false)
  const [exiting, setExiting] = useState(false)

  const beginExit = useCallback(() => {
    if (exiting) return
    setExiting(true)
    setTimeout(() => {
      setShow(false)
      try { sessionStorage.setItem(SPLASH_KEY, "1") } catch {}
    }, EXIT_DURATION)
  }, [exiting])

  useEffect(() => {
    // Respect prefers-reduced-motion
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReduced) {
      setShow(false)
      return
    }

    // Skip if already shown this session
    let alreadyShown = false
    try { alreadyShown = !!sessionStorage.getItem(SPLASH_KEY) } catch {}
    if (alreadyShown) {
      setShow(false)
      return
    }

    // Fresh session — start the sequential animation
    // Tiny rAF delay to ensure the white overlay paint has flushed before CSS anims begin
    requestAnimationFrame(() => {
      setAnimating(true)
    })

    const timer = setTimeout(() => {
      beginExit()
    }, SPLASH_DURATION)

    return () => clearTimeout(timer)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!show) return null

  return (
    <div
      role="status"
      aria-label="Loading Sri Sai"
      onClick={() => animating && beginExit()}
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white select-none ${animating ? "cursor-pointer" : ""} ${exiting ? "splash-exit" : ""}`}
    >
      <div className="flex flex-col items-center gap-5 px-6 text-center">

        {/* Step 1 — Logo scales in with spring bounce */}
        <div className={animating ? "splash-logo-animate" : "opacity-0"}>
          <img
            src="/logo.png"
            alt="Sri Sai Logo"
            draggable={false}
            className="w-20 h-20 sm:w-28 sm:h-28 object-contain"
            style={{ filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.12))" }}
          />
        </div>

        {/* Step 2 — Brand name slides up */}
        <h1
          className={`font-bold tracking-tight text-gray-900 text-3xl sm:text-4xl leading-none ${animating ? "splash-title-animate" : "opacity-0"}`}
        >
          Sri Sai
        </h1>

        {/* Step 3 — Gold accent line expands */}
        <div
          className={`h-[2px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-400 rounded-full ${animating ? "splash-line-animate" : "opacity-0"}`}
          style={{ width: "4rem" }}
        />

        {/* Step 4 — Subtitle slides up */}
        <p
          className={`text-xs sm:text-sm text-gray-400 font-semibold tracking-[0.2em] uppercase ${animating ? "splash-subtitle-animate" : "opacity-0"}`}
        >
          Home Appliances and Furnitures
        </p>
      </div>

      {/* Tap-to-skip hint — appears late so it does not clutter the reveal */}
      {animating && (
        <p
          className="absolute bottom-8 text-[10px] text-gray-300 tracking-[0.25em] uppercase"
          style={{ animation: "splash-text-in 0.5s ease-out 2.2s both" }}
        >
          tap anywhere to skip
        </p>
      )}
    </div>
  )
}
