// src/app/api/admin/keys/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return false
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true }
  })
  return user?.role === 'ADMIN'
}

// GET single key
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const key = await prisma.apiKey.findUnique({
      where: { id: params.id },
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
        ipWhitelist: true,
        lastUsed: true,
        createdAt: true,
        user: {
          select: { email: true, name: true }
        }
      }
    })

    if (!key) {
      return NextResponse.json(
        { status: false, message: 'Key not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ status: true, data: key })
  } catch (error) {
    console.error('Get key error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to fetch key' },
      { status: 500 }
    )
  }
}

// PATCH update key
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, isActive, tier, creditsDaily, rateLimit, ipWhitelist } = body

    const updated = await prisma.apiKey.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(tier !== undefined && { tier }),
        ...(creditsDaily !== undefined && { creditsDaily }),
        ...(rateLimit !== undefined && { rateLimit }),
        ...(ipWhitelist !== undefined && { ipWhitelist })
      }
    })

    return NextResponse.json({ status: true, data: updated })
  } catch (error) {
    console.error('Update key error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to update key' },
      { status: 500 }
    )
  }
}

// DELETE key
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!(await isAdmin())) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 })
    }

    await prisma.apiKey.delete({ where: { id: params.id } })

    return NextResponse.json({
      status: true,
      message: 'Key deleted successfully'
    })
  } catch (error) {
    console.error('Delete key error:', error)
    return NextResponse.json(
      { status: false, message: 'Failed to delete key' },
      { status: 500 }
    )
  }
}
