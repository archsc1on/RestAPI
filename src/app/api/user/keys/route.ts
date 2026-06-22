// src/app/api/user/keys/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const keys = await prisma.apiKey.findMany({
      where: { userId: session.user.id },
      select: {
        id: true, key: true, name: true, description: true, tier: true,
        creditsDaily: true, creditsUsed: true, rateLimit: true, isActive: true,
        totalRequests: true, successRequests: true, failedRequests: true,
        lastUsed: true, createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ status: true, data: keys })
  } catch (error) {
    console.error('Get user keys error:', error)
    return NextResponse.json({ status: false, message: 'Failed to fetch keys' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    // Ensure user exists in DB
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, creditsTier: true }
    })

    if (!user) {
      return NextResponse.json(
        { status: false, message: 'User not found in database. Please login again.' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { status: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    // Key limits by tier
    const keyLimits: Record<string, number> = {
      FREE: 1,
      PREMIUM: 5,
      VIP: 20
    }

    const existingKeys = await prisma.apiKey.count({
      where: { userId: user.id }
    })

    const limit = keyLimits[user.creditsTier] || 1
    if (existingKeys >= limit) {
      return NextResponse.json(
        { status: false, message: `Key limit reached for ${user.creditsTier} tier (max ${limit} key)` },
        { status: 403 }
      )
    }

    // Generate key
    const apiKey = generateApiKey()

    // Tier config
    const tierConfig: Record<string, { creditsDaily: number; rateLimit: number }> = {
      FREE: { creditsDaily: 100, rateLimit: 30 },
      PREMIUM: { creditsDaily: 10000, rateLimit: 120 },
      VIP: { creditsDaily: 100000, rateLimit: 500 }
    }

    const config = tierConfig[user.creditsTier] || tierConfig.FREE

    const newKey = await prisma.apiKey.create({
      data: {
        key: apiKey,
        userId: user.id,
        name: name.trim(),
        description: description || null,
        tier: user.creditsTier,
        creditsDaily: config.creditsDaily,
        rateLimit: config.rateLimit,
        isActive: true
      }
    })

    return NextResponse.json({
      status: true,
      message: 'API key created',
      data: {
        id: newKey.id,
        key: apiKey,
        name: newKey.name,
        tier: newKey.tier,
        creditsDaily: newKey.creditsDaily,
        rateLimit: newKey.rateLimit,
        createdAt: newKey.createdAt
      }
    })
  } catch (error) {
    console.error('Create user key error:', error)
    return NextResponse.json({ status: false, message: 'Failed to create key' }, { status: 500 })
  }
}
