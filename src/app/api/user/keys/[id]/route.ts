import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getSession() {
  return getServerSession(authOptions)
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const key = await prisma.apiKey.findFirst({
      where: { id, userId: session.user.id },
      select: {
        id: true, key: true, name: true, description: true, tier: true,
        creditsDaily: true, creditsUsed: true, rateLimit: true, isActive: true,
        ipWhitelist: true, totalRequests: true, successRequests: true,
        failedRequests: true, lastUsed: true, createdAt: true
      }
    })

    if (!key) {
      return NextResponse.json({ status: false, message: 'Key not found' }, { status: 404 })
    }

    return NextResponse.json({ status: true, data: key })
  } catch (error) {
    console.error('Get key error:', error)
    return NextResponse.json({ status: false, message: 'Failed to fetch key' }, { status: 500 })
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.apiKey.findFirst({
      where: { id, userId: session.user.id }
    })
    if (!existing) {
      return NextResponse.json({ status: false, message: 'Key not found' }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, isActive, ipWhitelist } = body

    const updated = await prisma.apiKey.update({
      where: { id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(isActive !== undefined && { isActive }),
        ...(ipWhitelist !== undefined && { ipWhitelist })
      },
      select: { id: true, name: true, description: true, isActive: true, ipWhitelist: true }
    })

    return NextResponse.json({ status: true, data: updated })
  } catch (error) {
    console.error('Update key error:', error)
    return NextResponse.json({ status: false, message: 'Failed to update key' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession()
    if (!session?.user?.id) {
      return NextResponse.json({ status: false, message: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const existing = await prisma.apiKey.findFirst({
      where: { id, userId: session.user.id }
    })
    if (!existing) {
      return NextResponse.json({ status: false, message: 'Key not found' }, { status: 404 })
    }

    await prisma.apiKey.delete({ where: { id } })

    return NextResponse.json({ status: true, message: 'Key deleted successfully' })
  } catch (error) {
    console.error('Delete key error:', error)
    return NextResponse.json({ status: false, message: 'Failed to delete key' }, { status: 500 })
  }
}
