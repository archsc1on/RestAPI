// src/lib/rate-limiter.ts
// In-memory rate limiter (no database model required)

interface RateLimitEntry {
  count: number
  resetAt: number
}

const store = new Map<string, RateLimitEntry>()

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of store) {
    if (entry.resetAt < now) {
      store.delete(key)
    }
  }
}, 5 * 60 * 1000)

export class RateLimiter {
  async check(key: string, options: { window: number; max: number }): Promise<boolean> {
    try {
      const now = Date.now()
      const entry = store.get(key)

      if (!entry || entry.resetAt < now) {
        // Create new entry or reset expired one
        store.set(key, {
          count: 1,
          resetAt: now + options.window,
        })
        return true
      }

      // Increment count
      entry.count += 1
      return entry.count <= options.max
    } catch (error) {
      console.error('Rate limit check error:', error)
      return true // Fail open
    }
  }

  async reset(key: string) {
    try {
      store.delete(key)
    } catch (error) {
      console.error('Rate limit reset error:', error)
    }
  }
}
