// src/lib/api-key.ts
import { prisma } from './prisma'
import crypto from 'crypto'

export const generateApiKey = (): string => {
  return 'sk_' + crypto.randomBytes(32).toString('hex')
}

export const isValidApiKeyFormat = (key: string): boolean => {
  return /^sk_[a-f0-9]{64}$/.test(key)
}

export const getApiKeyRecord = async (key: string) => {
  if (!isValidApiKeyFormat(key)) {
    return null
  }

  const record = await prisma.apiKey.findUnique({
    where: { key },
    include: { user: true }
  })

  if (!record || !record.isActive) {
    return null
  }

  // Daily credit reset for API key
  const now = new Date()
  const resetTime = new Date(record.creditsReset)
  const isNewDay = now.getUTCDate() !== resetTime.getUTCDate() ||
                   now.getUTCMonth() !== resetTime.getUTCMonth() ||
                   now.getUTCFullYear() !== resetTime.getUTCFullYear()

  if (isNewDay) {
    await prisma.apiKey.update({
      where: { id: record.id },
      data: { creditsUsed: 0, creditsReset: now }
    })
    record.creditsUsed = 0
    record.creditsReset = now
  }

  return record
}

export const hasEnoughCredits = async (userId: string, cost: number = 1): Promise<{ enough: boolean; available: number }> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  })

  const available = user?.credits || 0
  return { enough: available >= cost, available }
}

export const deductCredits = async (userId: string, cost: number = 1) => {
  return prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: cost } }
  })
}

export const updateKeyStats = async (keyId: string, success: boolean) => {
  const data: any = {
    totalRequests: { increment: 1 },
    lastUsed: new Date()
  }

  if (success) {
    data.successRequests = { increment: 1 }
  } else {
    data.failedRequests = { increment: 1 }
  }

  return await prisma.apiKey.update({
    where: { id: keyId },
    data
  })
}

export const checkRateLimit = async (keyId: string): Promise<boolean> => {
  const key = await prisma.apiKey.findUnique({
    where: { id: keyId }
  })

  if (!key) return false

  const now = new Date()
  const minuteAgo = new Date(now.getTime() - 60000)

  const recentLogs = await prisma.apiLog.count({
    where: {
      keyId,
      createdAt: { gte: minuteAgo }
    }
  })

  return recentLogs < key.rateLimit
}
