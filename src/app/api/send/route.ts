// src/app/api/send/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getApiKeyRecord,
  hasEnoughCredits,
  deductCredits,
  updateKeyStats,
  checkRateLimit
} from '@/lib/api-key'

type Platform = 'whatsapp' | 'telegram' | 'discord'

interface SendRequest {
  platform: Platform
  phoneNumber?: string
  chatId?: string
  channelId?: string
  message: string
  media?: string
}

async function sendWhatsApp(phoneNumber: string, message: string): Promise<boolean> {
  console.log(`WhatsApp to ${phoneNumber}: ${message}`)
  return true
}

async function sendTelegram(chatId: string, message: string): Promise<boolean> {
  console.log(`Telegram to ${chatId}: ${message}`)
  return true
}

async function sendDiscord(channelId: string, message: string): Promise<boolean> {
  console.log(`Discord to ${channelId}: ${message}`)
  return true
}

export async function POST(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { status: false, message: 'Missing API key (use x-api-key header)' },
        { status: 401 }
      )
    }

    const keyRecord = await getApiKeyRecord(apiKey)
    if (!keyRecord) {
      return NextResponse.json(
        { status: false, message: 'Invalid or inactive API key' },
        { status: 401 }
      )
    }

    // Check rate limit
    const withinRateLimit = await checkRateLimit(keyRecord.id)
    if (!withinRateLimit) {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json(
        { status: false, message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    const body = await request.json() as SendRequest

    const validPlatforms: Platform[] = ['whatsapp', 'telegram', 'discord']
    if (!validPlatforms.includes(body.platform)) {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json(
        {
          status: false,
          message: `Invalid platform. Supported: ${validPlatforms.join(', ')}`
        },
        { status: 400 }
      )
    }

    if (!body.message || body.message.trim().length === 0) {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json(
        { status: false, message: 'Message cannot be empty' },
        { status: 400 }
      )
    }

    // Check credits on USER account (not API key!)
    const creditCost = 1
    const creditCheck = await hasEnoughCredits(keyRecord.userId, creditCost)
    if (!creditCheck.enough) {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json(
        {
          status: false,
          message: 'Insufficient credits',
          remaining: creditCheck.available
        },
        { status: 402 }
      )
    }

    // Send message based on platform
    let success = false
    let recipient = ''

    switch (body.platform) {
      case 'whatsapp':
        if (!body.phoneNumber) {
          return NextResponse.json(
            { status: false, message: 'phoneNumber required for WhatsApp' },
            { status: 400 }
          )
        }
        success = await sendWhatsApp(body.phoneNumber, body.message)
        recipient = body.phoneNumber
        break

      case 'telegram':
        if (!body.chatId) {
          return NextResponse.json(
            { status: false, message: 'chatId required for Telegram' },
            { status: 400 }
          )
        }
        success = await sendTelegram(body.chatId, body.message)
        recipient = body.chatId
        break

      case 'discord':
        if (!body.channelId) {
          return NextResponse.json(
            { status: false, message: 'channelId required for Discord' },
            { status: 400 }
          )
        }
        success = await sendDiscord(body.channelId, body.message)
        recipient = body.channelId
        break
    }

    // Log the API request
    await prisma.apiLog.create({
      data: {
        keyId: keyRecord.id,
        userId: keyRecord.userId,
        endpoint: '/api/send',
        method: 'POST',
        platform: body.platform,
        phoneNumber: body.phoneNumber,
        messageLength: body.message.length,
        statusCode: success ? 200 : 500,
        costCredits: creditCost,
        ip: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || ''
      }
    })

    // Deduct credits from USER account only if successful
    if (success) {
      await deductCredits(keyRecord.userId, creditCost)
      await updateKeyStats(keyRecord.id, true)

      const remaining = await prisma.user.findUnique({
        where: { id: keyRecord.userId },
        select: { credits: true }
      })

      return NextResponse.json({
        status: true,
        message: `Message sent via ${body.platform}`,
        data: {
          platform: body.platform,
          recipient,
          messageLength: body.message.length,
          costCredits: creditCost,
          remaining: remaining?.credits || 0,
          timestamp: new Date().toISOString()
        }
      })
    } else {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json(
        { status: false, message: `Failed to send via ${body.platform}` },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('API send error:', error)
    return NextResponse.json(
      {
        status: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: true,
    message: 'Use POST to send messages',
    endpoints: {
      post: '/api/send',
      platforms: ['whatsapp', 'telegram', 'discord']
    }
  })
}
