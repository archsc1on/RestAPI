// src/app/api/auth/otp/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, saveOTP, sendOTPEmail, verifyOTP } from '@/lib/otp'

// POST /api/auth/otp - Send OTP to email
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, action } = body

    if (!email) {
      return NextResponse.json(
        { status: false, message: 'Email is required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase()

    // Action: Send OTP
    if (action === 'send-otp' || !action) {
      const otp = generateOTP()

      // Find or create user
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

      // Save OTP
      await saveOTP(user.id, otp)

      // Send OTP via email
      await sendOTPEmail(normalizedEmail, otp)

      return NextResponse.json({
        status: true,
        message: 'OTP sent successfully',
        data: {
          email: normalizedEmail,
          expiresIn: 600 // 10 minutes in seconds
        }
      })
    }

    // Action: Verify OTP
    if (action === 'verify-otp') {
      const { otp } = body
      if (!otp) {
        return NextResponse.json(
          { status: false, message: 'OTP is required' },
          { status: 400 }
        )
      }

      const isValid = await verifyOTP(normalizedEmail, otp)
      if (!isValid) {
        return NextResponse.json(
          { status: false, message: 'Invalid or expired OTP' },
          { status: 401 }
        )
      }

      const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })

      return NextResponse.json({
        status: true,
        message: 'OTP verified successfully',
        data: {
          userId: user?.id,
          email: user?.email,
          name: user?.name
        }
      })
    }

    return NextResponse.json(
      { status: false, message: 'Invalid action. Use "send-otp" or "verify-otp"' },
      { status: 400 }
    )
  } catch (error) {
    console.error('OTP API error:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
