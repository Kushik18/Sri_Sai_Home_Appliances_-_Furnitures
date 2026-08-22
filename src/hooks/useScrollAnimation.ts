"use client"
import { useEffect } from "react"

/**
 * Scroll-triggered reveal animation hook.
 * Watches all elements with .reveal, .reveal-left, .reveal-right, .reveal-scale
 * and adds .is-visible when they enter the viewport.
 *
 * - Uses threshold: 0.18 so elements feel "arrived" before animating
 * - Calls observer.unobserve after trigger — elements stay visible, no re-animation on scroll-up
 * - MutationObserver handles late-appearing elements (data-fetched cards, etc.)
 * - Immediately marks all elements visible if prefers-reduced-motion is set
 */
export function useScrollAnimation() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches

    // If user prefers reduced motion, immediately show all elements
    if (prefersReduced) {
      document
        .querySelectorAll(".reveal, .reveal-left, .reveal-right, .reveal-scale")
        .forEach(el => el.classList.add("is-visible"))
      return
    }

    const selector = ".reveal, .reveal-left, .reveal-right, .reveal-scale"

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible")
            observer.unobserve(entry.target) // Once visible, stays visible (deliberate)
          }
        })
      },
      { threshold: 0.18 }
    )

    // Observe all currently rendered reveal elements
    document.querySelectorAll(selector).forEach(el => observer.observe(el))

    // MutationObserver: picks up any elements added to the DOM after initial mount
    // (e.g., if any cards are client-fetched after hydration)
    const mutationObserver = new MutationObserver(() => {
      document.querySelectorAll(`${selector}:not(.is-visible)`).forEach(el => {
        observer.observe(el)
      })
    })

    mutationObserver.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutationObserver.disconnect()
    }
  }, [])
}
