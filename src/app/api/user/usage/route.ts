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

    const [todayUsage, weekUsage, monthUsage, yearUsage, dailyRaw] = await Promise.all([
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
      prisma.$queryRaw<{ date: string; used: number }[]>`
        SELECT
          TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date,
          SUM("costCredits")::int AS used
        FROM "ApiLog"
        WHERE "userId" = ${session.user.id}
          AND "createdAt" >= ${thirtyDaysAgo}
        GROUP BY TO_CHAR("createdAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD')
        ORDER BY date ASC
      `,
    ])

    const dailyMap = new Map(dailyRaw.map((r) => [r.date, r.used]))

    const daily: { date: string; used: number }[] = []
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateStr = d.toISOString().split('T')[0]
      daily.push({ date: dateStr, used: dailyMap.get(dateStr) || 0 })
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
