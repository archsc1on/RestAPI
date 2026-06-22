// src/app/api/admin/keys/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { generateApiKey } from '@/lib/api-key'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return false
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })
  return user?.role === 'ADMIN'
}

// GET all API keys (admin endpoint)
export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const keys = await prisma.apiKey.findMany({
      select: {
        id: true,
        key: true,
        name: true,
        description: true,
        tier: true,
        creditsDaily: true,
        creditsUsed: true,
        rateLimit: true,
        totalRequests: true,
        successRequests: true,
        failedRequests: true,
        isActive: true,
        createdAt: true,
        user: {
          select: { email: true, name: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      status: true,
      data: keys
    })
  } catch (error) {
    console.error('Admin get keys error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch keys' },
      { status: 500 }
    )
  }
}

// POST create new API key (admin can create for any user)
export async function POST(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, userId, tier } = body

    if (!name) {
      return NextResponse.json(
        { status: false, message: 'Name is required' },
        { status: 400 }
      )
    }

    const apiKey = generateApiKey()

    const tierConfig: Record<string, { creditsDaily: number; rateLimit: number }> = {
      FREE: { creditsDaily: 100, rateLimit: 30 },
      PREMIUM: { creditsDaily: 10000, rateLimit: 120 },
      VIP: { creditsDaily: 100000, rateLimit: 500 }
    }

    const config = tierConfig[tier || 'FREE'] || tierConfig.FREE

    const newKey = await prisma.apiKey.create({
      data: {
        key: apiKey,
        userId: userId || 'system',
        name,
        description,
        tier: tier || 'FREE',
        creditsDaily: config.creditsDaily,
        rateLimit: config.rateLimit,
        isActive: true
      }
    })

    return NextResponse.json({
      status: true,
      data: {
        ...newKey,
        key: apiKey
      }
    })
  } catch (error) {
    console.error('Admin create key error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to create key' },
      { status: 500 }
    )
  }
}
