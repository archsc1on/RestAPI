// src/lib/api-helpers.ts
import { NextRequest, NextResponse } from 'next/server'
import { ZodSchema, ZodError } from 'zod'
import { logger } from './logger'
import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import prisma from './prisma'

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: string
  message?: string
  meta?: {
    page?: number
    limit?: number
    total?: number
  }
}

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export async function withAuth(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    throw new ApiError(401, 'Unauthorized')
  }
  return session
}

export async function withApiKey(req: NextRequest, platform?: string) {
  const authHeader = req.headers.get('authorization')
  const apiKeyHeader = req.headers.get('x-api-key')

  const key = apiKeyHeader || (authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null)

  if (!key) {
    throw new ApiError(401, 'API key required (use x-api-key or Authorization: Bearer header)')
  }

  const apiKey = await prisma.apiKey.findFirst({
    where: {
      key,
      isActive: true,
      ...(platform ? { platform } : {})
    },
    include: { user: true }
  })

  if (!apiKey) {
    throw new ApiError(401, 'Invalid or inactive API key')
  }

  // Check IP whitelist
  if (apiKey.ipWhitelist) {
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
    const allowedIPs = apiKey.ipWhitelist.split(',').map(ip => ip.trim())
    if (!allowedIPs.includes(ip)) {
      throw new ApiError(403, 'IP not whitelisted')
    }
  }

  return { apiKey, user: apiKey.user }
}

// Check if user has enough credits (credits are on User, not ApiKey)
export async function hasEnoughCredits(userId: string, required: number = 1): Promise<{ enough: boolean; available: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  })

  if (!user) return { enough: false, available: 0 }

  return {
    enough: user.credits >= required,
    available: user.credits
  }
}

// Deduct credits from USER account
export async function deductCredits(userId: string, amount: number = 1) {
  return prisma.user.update({
    where: { id: userId },
    data: { credits: { decrement: amount } }
  })
}

// Get remaining credits for user
export async function getRemainingCredits(userId: string): Promise<number> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true }
  })
  return user?.credits || 0
}

export function validateBody<T>(schema: ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ApiError(400, 'Validation failed', error.errors)
    }
    throw error
  }
}

export function successResponse<T>(data: T, meta?: any): NextResponse {
  return NextResponse.json({
    success: true,
    data,
    ...(meta ? { meta } : {})
  }, { status: 200 })
}

export function errorResponse(error: unknown): NextResponse {
  if (error instanceof ApiError) {
    return NextResponse.json({
      success: false,
      error: error.message,
      details: error.details
    }, { status: error.statusCode })
  }

  logger.error('Unhandled error:', error)
  return NextResponse.json({
    success: false,
    error: 'Internal server error'
  }, { status: 500 })
}

export function paginateQuery(url: string, page: number = 1, limit: number = 10) {
  const skip = (page - 1) * limit
  const take = Math.min(limit, 100)

  const baseUrl = url.split('?')[0]
  const prevPage = page > 1 ? page - 1 : null

  return { skip, take, prevPage, baseUrl }
}

export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async function(req: NextRequest) {
    try {
      return await handler(req)
    } catch (error) {
      return errorResponse(error)
    }
  }
}
