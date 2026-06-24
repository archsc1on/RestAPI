import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

const TIER_CONFIG: Record<string, { creditsDaily: number; rateLimit: number; keysLimit: number; price: number }> = {
  FREE: { creditsDaily: 100, rateLimit: 30, keysLimit: 1, price: 0 },
  PREMIUM: { creditsDaily: 10000, rateLimit: 120, keysLimit: 5, price: 25000 },
  VIP: { creditsDaily: 100000, rateLimit: 500, keysLimit: 20, price: 50000 }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { tier } = body as { tier: string }

    if (!tier || !['FREE', 'PREMIUM', 'VIP'].includes(tier)) {
      return NextResponse.json(
        { status: false, message: 'Invalid tier. Choose: FREE, PREMIUM, VIP' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({ where: { id: session.user.id } })
    if (!user) {
      return NextResponse.json({ status: false, message: 'User not found' }, { status: 404 })
    }

    if (user.creditsTier === tier) {
      return NextResponse.json(
        { status: false, message: `Already on ${tier} tier` },
        { status: 400 }
      )
    }

    const config = TIER_CONFIG[tier]
    const newCredits = config.creditsDaily

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        creditsTier: tier,
        credits: newCredits,
        creditsReset: new Date()
      }
    })

    const keys = await prisma.apiKey.findMany({ where: { userId: session.user.id } })
    for (const key of keys) {
      await prisma.apiKey.update({
        where: { id: key.id },
        data: {
          tier,
          creditsDaily: config.creditsDaily,
          rateLimit: config.rateLimit
        }
      })
    }

    return NextResponse.json({
      status: true,
      message: `Upgraded to ${tier}`,
      data: {
        tier,
        creditsDaily: config.creditsDaily,
        rateLimit: config.rateLimit,
        keysLimit: config.keysLimit,
        credits: newCredits
      }
    })
  } catch (error) {
    console.error('Upgrade error:', error)
    return NextResponse.json({ status: false, message: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    status: true,
    data: {
      tiers: Object.entries(TIER_CONFIG).map(([name, config]) => ({
        name,
        creditsDaily: config.creditsDaily,
        rateLimit: config.rateLimit,
        keysLimit: config.keysLimit,
        price: config.price
      }))
    }
  })
}
