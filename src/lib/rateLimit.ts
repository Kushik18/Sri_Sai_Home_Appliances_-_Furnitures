

/**
 * Simple in-memory rate limiter for serverless environments.
 * 
 * For production at scale, swap this with @upstash/ratelimit + @upstash/redis
 * by setting UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env,
 * then using:
 *   import { Ratelimit } from "@upstash/ratelimit"
 *   import { Redis } from "@upstash/redis"
 *   const ratelimit = new Ratelimit({ redis: Redis.fromEnv(), limiter: Ratelimit.slidingWindow(5, "60 s") })
 *
 * The in-memory approach below works well for single-instance deployments (Vercel serverless
 * restarts clear the map, but still protects against burst abuse within a single invocation lifetime).
 */

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

/**
 * Check rate limit for a given identifier.
 * @param identifier - Unique key (e.g. IP address, session ID)
 * @param maxRequests - Maximum number of requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns { success: boolean, remaining: number }
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number
): { success: boolean; remaining: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  // Cleanup old entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    for (const [key, val] of rateLimitMap) {
      if (val.resetAt < now) rateLimitMap.delete(key)
    }
  }

  if (!entry || entry.resetAt < now) {
    rateLimitMap.set(identifier, { count: 1, resetAt: now + windowMs })
    return { success: true, remaining: maxRequests - 1 }
  }

  if (entry.count >= maxRequests) {
    return { success: false, remaining: 0 }
  }

  entry.count++
  return { success: true, remaining: maxRequests - entry.count }
}
