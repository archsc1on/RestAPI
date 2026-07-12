import crypto from 'crypto'
import nodemailer from 'nodemailer'
import prisma from './prisma'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
})

export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export const isValidOTPFormat = (otp: string): boolean => {
  return /^\d{6}$/.test(otp)
}

const hashOTP = (otp: string): string => {
  return crypto.createHash('sha256').update(otp).digest('hex')
}

export const saveOTP = async (userId: string, otp: string) => {
  const hashedOTP = hashOTP(otp)
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000)

  return prisma.user.update({
    where: { id: userId },
    data: { otp: hashedOTP, otpExpires },
  })
}

export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

  if (!user || !user.otp || !user.otpExpires) return false
  if (user.otpExpires < new Date()) return false

  const inputHash = Buffer.from(hashOTP(otp))
  const storedHash = Buffer.from(user.otp)

  if (inputHash.length !== storedHash.length) return false

  const isValid = crypto.timingSafeEqual(inputHash, storedHash)

  if (isValid) {
    await prisma.user.update({
      where: { id: user.id },
      data: { otp: null, otpExpires: null, emailVerified: true, lastLogin: new Date() },
    })
  }

  return isValid
}

export const sendOTPEmail = async (email: string, otp: string): Promise<boolean> => {
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: email,
      subject: 'Your Verification Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; text-align: center;">Verification Code</h2>
          <p style="color: #666; text-align: center;">Use the code below to verify your email:</p>
          <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 8px; color: #333;">${otp}</span>
          </div>
          <p style="color: #999; text-align: center; font-size: 12px;">This code expires in 10 minutes. If you didn't request this, ignore this email.</p>
        </div>
      `,
    })
    return true
  } catch (error) {
    console.error('[OTP] Failed to send email:', error)
    console.log(`[OTP] Fallback - code for ${email}: ${otp}`)
    return false
  }
}
