import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function isAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return false
  const user = await prisma.user.findUnique({ where: { id: session.user.id }, select: { role: true } })
  return user?.role === 'ADMIN'
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Admin access required' }, { status: 403 })

  return NextResponse.json({
    status: true,
    data: {
      plans: [
        { name: 'FREE', price: 0, creditsDaily: 100, rateLimit: 30, keysLimit: 1 },
        { name: 'PREMIUM', price: 25000, creditsDaily: 10000, rateLimit: 120, keysLimit: 5 },
        { name: 'VIP', price: 50000, creditsDaily: 100000, rateLimit: 500, keysLimit: 20 }
      ]
    }
  })
}
