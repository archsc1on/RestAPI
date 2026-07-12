import { prisma } from './prisma'
import crypto from 'crypto'

interface RateLimitEntry {
  count: number
  resetAt: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore) {
    if (entry.resetAt < now) rateLimitStore.delete(key)
  }
}, 60000)

export const generateApiKey = (): string => {
  return 'sk_' + crypto.randomBytes(32).toString('hex')
}

export const isValidApiKeyFormat = (key: string): boolean => {
  return /^sk_[a-f0-9]{64}$/.test(key)
}

export const getApiKeyRecord = async (key: string) => {
  if (!isValidApiKeyFormat(key)) return null

  const record = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: true },
  })

  if (!record || !record.isActive) return null

  const now = new Date()
  const resetTime = new Date(record.creditsReset)
  const isNewDay =
    now.getUTCDate() !== resetTime.getUTCDate() ||
    now.getUTCMonth() !== resetTime.getUTCMonth() ||
    now.getUTCFullYear() !== resetTime.getUTCFullYear()

  if (isNewDay) {
    await prisma.apiKey.update({
      where: { id: record.id },
      data: { creditsUsed: 0, creditsReset: now },
    })
    record.creditsUsed = 0
    record.creditsReset = now
  }

  return record
}

export const hasEnoughCredits = async (
  userId: string,
  cost: number = 1
): Promise<{ enough: boolean; available: number }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true },
  })

  const available = user?.credits || 0
  return { enough: available >= cost, available }
}

export const deductCredits = async (userId: string, cost: number = 1) => {
  return prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: cost } },
  })
}

export const updateKeyStats = async (keyId: string, success: boolean) => {
  return prisma.apiKey.update({
    where: { id: keyId },
    data: {
      totalRequests: { increment: 1 },
      lastUsed: new Date(),
      ...(success
        ? { successRequests: { increment: 1 } }
        : { failedRequests: { increment: 1 } }),
    },
  })
}

export const checkRateLimit = async (keyId: string, rateLimit?: number): Promise<boolean> => {
  const now = Date.now()
  const storeKey = `rl:${keyId}`
  const entry = rateLimitStore.get(storeKey)
  const limit = rateLimit ?? 30

  if (!entry || entry.resetAt < now) {
    rateLimitStore.set(storeKey, { count: 1, resetAt: now + 60000 })
    return true
  }

  entry.count++
  return entry.count <= limit
}
