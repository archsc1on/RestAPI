// src/app/api/admin/users/route.ts
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

    const users = await prisma.user.findMany({
      select: {
        id: true, email: true, name: true, provider: true, role: true,
        credits: true, creditsTier: true, isActive: true, lastLogin: true,
        createdAt: true,
        _count: { select: { apiKeys: true, logs: true } }
      },
      orderBy: { createdAt: 'desc' }
    })

    const stats = {
      totalUsers: users.length,
      totalApiKeys: await prisma.apiKey.count(),
      totalLogs: await prisma.apiLog.count(),
      totalCredits: await prisma.user.aggregate({ _sum: { credits: true } })
    }

    return NextResponse.json({
      success: true,
      stats: { ...stats, totalCredits: stats.totalCredits._sum.credits || 0 },
      users
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { userId, credits, creditsTier, role, isActive } = body
    if (!userId) {
      return NextResponse.json({ error: 'userId is required' }, { status: 400 })
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(credits !== undefined && { credits }),
        ...(creditsTier !== undefined && { creditsTier }),
        ...(role !== undefined && { role }),
        ...(isActive !== undefined && { isActive })
      },
      select: { id: true, email: true, name: true, credits: true, creditsTier: true, role: true, isActive: true }
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}
