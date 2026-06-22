// src/app/api/user/credits/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { credits: true, creditsTier: true, creditsReset: true }
    })

    if (!user) {
      return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 })
    }

    // Daily credit reset
    const now = new Date()
    const resetTime = new Date(user.creditsReset)
    const isNewDay = now.getUTCDate() !== resetTime.getUTCDate() ||
                     now.getUTCMonth() !== resetTime.getUTCMonth() ||
                     now.getUTCFullYear() !== resetTime.getUTCFullYear()

    let credits = user.credits
    if (isNewDay) {
      const tierCredits: Record<string, number> = {
        FREE: 100,
        PREMIUM: 10000,
        VIP: 100000
      }
      credits = tierCredits[user.creditsTier] || 100

      await prisma.user.update({
        where: { id: session.user.id },
        data: { credits, creditsReset: now }
      })
    }

    // Get API key stats
    const apiKey = await prisma.apiKey.findFirst({
      where: { userId: session.user.id },
      select: { creditsDaily: true, creditsUsed: true }
    })

    return NextResponse.json({
      status: true,
      data: {
        credits,
        tier: user.creditsTier,
        creditsDaily: apiKey?.creditsDaily || 0,
        creditsUsedToday: apiKey?.creditsUsed || 0,
        creditsReset: user.creditsReset
      }
    })
  } catch (error) {
    console.error('Get credits error:', error)
    return NextResponse.json({ status: false, message: 'Failed to fetch credits' }, { status: 500 })
  }
}
