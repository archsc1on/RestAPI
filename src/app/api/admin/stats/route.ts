// src/app/api/admin/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return false
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })
  return user?.role === 'ADMIN'
}

export async function GET() {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const [
      totalUsers,
      totalApiKeys,
      totalLogs,
      totalCredits,
      todayLogs,
      activeKeys
    ] = await Promise.all([
      prisma.user.count(),
      prisma.apiKey.count(),
      prisma.apiLog.count(),
      prisma.user.aggregate({ _sum: { credits: true } }),
      prisma.apiLog.count({
        where: { createdAt: { gte: today } }
      }),
      prisma.apiKey.count({
        where: { isActive: true }
      })
    ])

    return NextResponse.json({
      success: true,
      data: {
        totalUsers,
        totalApiKeys,
        totalLogs,
        totalCredits: totalCredits._sum.credits || 0,
        todayLogs,
        activeKeys,
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
      }
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get stats' },
      { status: 500 }
    )
  }
}
