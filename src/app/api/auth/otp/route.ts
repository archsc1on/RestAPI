import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, saveOTP, sendOTPEmail, verifyOTP } from '@/lib/otp'
import { checkOtpRateLimit, checkBruteForce } from '@/lib/security'

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || '127.0.0.1'
    const body = await request.json()
    const { email, action } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ status: false, message: 'Email is required' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return NextResponse.json({ status: false, message: 'Invalid email format' }, { status: 400 })
    }

    if (normalizedEmail.length > 254) {
      return NextResponse.json({ status: false, message: 'Email too long' }, { status: 400 })
    }

    if (action === 'send-otp' || !action) {
      const { allowed, retryAfter } = checkOtpRateLimit(ip, 5, 900000)
      if (!allowed) {
        return NextResponse.json(
          { status: false, message: `Too many requests. Try again in ${retryAfter} seconds` },
          { status: 429 }
        )
      }

      if (!checkBruteForce(`otp-send:${normalizedEmail}`, 10, 3600000)) {
        return NextResponse.json(
          { status: false, message: 'Account temporarily locked due to too many attempts' },
          { status: 429 }
        )
      }

      const otp = generateOTP()

      let user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: normalizedEmail,
            provider: 'email',
            name: normalizedEmail.split('@')[0],
            credits: 100
          }
        })
      }

      await saveOTP(user.id, otp)
      await sendOTPEmail(normalizedEmail, otp)

      return NextResponse.json({
        status: true,
        message: 'OTP sent successfully',
        data: { email: normalizedEmail, expiresIn: 600 }
      })
    }

    if (action === 'verify-otp') {
      const { otp } = body
      if (!otp || typeof otp !== 'string' || !/^\d{6}$/.test(otp)) {
        return NextResponse.json({ status: false, message: 'Valid 6-digit OTP required' }, { status: 400 })
      }

      if (!checkBruteForce(`otp-verify:${normalizedEmail}`, 10, 3600000)) {
        return NextResponse.json(
          { status: false, message: 'Too many failed attempts. Account temporarily locked' },
          { status: 429 }
        )
      }

      const isValid = await verifyOTP(normalizedEmail, otp)
      if (!isValid) {
        return NextResponse.json({ status: false, message: 'Invalid or expired OTP' }, { status: 401 })
      }

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

      return NextResponse.json({
        status: true,
        message: 'OTP verified successfully',
        data: { userId: user?.id, email: user?.email, name: user?.name }
      })
    }

    return NextResponse.json(
      { status: false, message: 'Invalid action. Use "send-otp" or "verify-otp"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('OTP API error:', error)
    return NextResponse.json({ status: false, message: 'Internal server error' }, { status: 500 })
  }
}
