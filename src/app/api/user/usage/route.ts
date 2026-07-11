import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const sevenDaysAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const oneYearAgo = new Date(today.getTime() - 365 * 24 * 60 * 60 * 1000)

    // Get user tier for limits
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { creditsTier: true },
    })

    const tierLimits: Record<string, number> = {
      FREE: 100,
      PREMIUM: 10000,
      VIP: 100000,
    }
    const dailyLimit = tierLimits[user?.creditsTier || 'FREE'] || 100

    // Aggregate usage per period
    const [todayUsage, weekUsage, monthUsage, yearUsage] = await Promise.all([
      prisma.apiLog.aggregate({
        where: { userId: session.user.id, createdAt: { gte: today } },
        _sum: { costCredits: true },
      }),
      prisma.apiLog.aggregate({
        where: { userId: session.user.id, createdAt: { gte: sevenDaysAgo } },
        _sum: { costCredits: true },
      }),
      prisma.apiLog.aggregate({
        where: { userId: session.user.id, createdAt: { gte: thirtyDaysAgo } },
        _sum: { costCredits: true },
      }),
      prisma.apiLog.aggregate({
        where: { userId: session.user.id, createdAt: { gte: oneYearAgo } },
        _sum: { costCredits: true },
      }),
    ])

    // Daily breakdown for last 30 days (for chart)
    const dailyLogs = await prisma.apiLog.groupBy({
      by: ['createdAt'],
      where: { userId: session.user.id, createdAt: { gte: thirtyDaysAgo } },
      _sum: { costCredits: true },
    })

    // Build 30-day array
    const daily: { date: string; used: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      const dayData = dailyLogs.find((log) => {
        const logDate = new Date(log.createdAt).toISOString().split('T')[0]
        return logDate === dateStr
      })
      daily.push({ date: dateStr, used: dayData?._sum.costCredits || 0 })
    }

    return NextResponse.json({
      status: true,
      data: {
        today: { used: todayUsage._sum.costCredits || 0, limit: dailyLimit },
        week: { used: weekUsage._sum.costCredits || 0, limit: dailyLimit * 7 },
        month: { used: monthUsage._sum.costCredits || 0, limit: dailyLimit * 30 },
        year: { used: yearUsage._sum.costCredits || 0, limit: dailyLimit * 365 },
        daily,
      },
    })
  } catch (error) {
    console.error('Get usage error:', error)
    return NextResponse.json({ status: false, message: 'Failed to fetch usage' }, { status: 500 })
  }
}
