// src/lib/rate-limiter.ts
import prisma from './prisma'

export class RateLimiter {
  async check(key: string, options: { window: number; max: number }): Promise<boolean> {
    try {
      const now = new Date()
      const resetAt = new Date(now.getTime() + options.window)

      const record = await prisma.rateLimit.upsert({
        where: { key },
        update: {
          count: { increment: 1 },
          resetAt,
          updatedAt: now
        },
        create: {
          key,
          count: 1,
          resetAt
        }
      })

      // Check if need to reset
      if (new Date(record.resetAt) < now) {
        await prisma.rateLimit.update({
          where: { key },
          data: { count: 1, resetAt }
        })
        return true
      }

      return record.count <= options.max
    } catch (error) {
      console.error('Rate limit check error:', error)
      return true // Fail open
    }
  }

  async reset(key: string) {
    try {
      await prisma.rateLimit.deleteMany({ where: { key } })
    } catch (error) {
      console.error('Rate limit reset error:', error)
    }
  }
}
