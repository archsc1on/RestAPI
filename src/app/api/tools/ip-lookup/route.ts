// src/app/api/tools/ip-lookup/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiKeyRecord, checkRateLimit, updateKeyStats, deductCredits, hasEnoughCredits } from '@/lib/api-key'

interface IPInfo {
  ip: string
  city: string
  region: string
  country: string
  loc: string
  org: string
  postal: string
  timezone: string
}

async function lookupIP(ip: string): Promise<IPInfo | null> {
  // Use free IP API services
  try {
    // First try ipinfo.io (free tier: 100k/month)
    const response = await fetch(`https://ipinfo.io/${ip}/json`)
    if (response.ok) {
      const data = await response.json()
      return {
        ip: data.ip || ip,
        city: data.city || '',
        region: data.region || '',
        country: data.country || '',
        loc: data.loc || '',
        org: data.org || '',
        postal: data.postal || '',
        timezone: data.timezone || ''
      }
    }
  } catch (error) {
    console.error('IP lookup error:', error)
  }

  // Fallback to ip-api.com
  try {
    const response = await fetch(`http://ip-api.com/json/${ip}`)
    if (response.ok) {
      const data = await response.json()
      if (data.status === 'success') {
        return {
          ip: data.query || ip,
          city: data.city || '',
          region: data.regionName || '',
          country: data.country || '',
          loc: `${data.lat},${data.lon}`,
          org: data.org || '',
          postal: data.zip || '',
          timezone: data.timezone || ''
        }
      }
    }
  } catch (error) {
    console.error('IP lookup fallback error:', error)
  }

  return null
}

// GET /api/tools/ip-lookup?ip=1.1.1.1
// GET /api/tools/ip-lookup (returns caller's IP)
export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json(
        { status: false, message: 'API key required' },
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

    // Rate limit check
    const withinLimit = await checkRateLimit(keyRecord.id)
    if (!withinLimit) {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json(
        { status: false, message: 'Rate limit exceeded' },
        { status: 429 }
      )
    }

    // Credit check (1 credit per lookup)
    const creditCost = 1
    const creditCheck = await hasEnoughCredits(keyRecord.userId, creditCost)
    if (!creditCheck.enough) {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json(
        { status: false, message: 'Insufficient credits', remaining: creditCheck.available },
        { status: 402 }
      )
    }

    const { searchParams } = new URL(request.url)
    let ip = searchParams.get('ip') || ''

    // If no IP provided, use caller's IP
    if (!ip) {
      ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
           request.headers.get('x-real-ip') ||
           ''
    }

    // Validate IP format
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/
    const ipv6Regex = /^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::ffff:\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/

    if (ip && !ipv4Regex.test(ip) && !ipv6Regex.test(ip)) {
      return NextResponse.json(
        { status: false, message: 'Invalid IP format' },
        { status: 400 }
      )
    }

    const result = await lookupIP(ip)

    if (!result) {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json(
        { status: false, message: 'Failed to lookup IP' },
        { status: 500 }
      )
    }

    // Log and deduct
    await prisma.apiLog.create({
      data: {
        keyId: keyRecord.id,
        userId: keyRecord.userId,
        endpoint: '/api/tools/ip-lookup',
        method: 'GET',
        statusCode: 200,
        costCredits: creditCost,
        ip: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || ''
      }
    })

    await deductCredits(keyRecord.userId, creditCost)
    await updateKeyStats(keyRecord.id, true)

    const remaining = await prisma.user.findUnique({
      where: { id: keyRecord.userId },
      select: { credits: true }
    })

    return NextResponse.json({
      status: true,
      data: {
        ...result,
        costCredits: creditCost,
        remaining: remaining?.credits || 0
      }
    })
  } catch (error) {
    console.error('IP lookup API error:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
