import { NextRequest, NextResponse } from 'next/server'
import { getApiKeyRecord, checkRateLimit, updateKeyStats, deductCredits, hasEnoughCredits } from '@/lib/api-key'
import { prisma } from '@/lib/prisma'
import { cobaltDownload } from '@/lib/cobalt'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) return NextResponse.json({ status: false, message: 'API key required' }, { status: 401 })

    const keyRecord = await getApiKeyRecord(apiKey)
    if (!keyRecord) return NextResponse.json({ status: false, message: 'Invalid API key' }, { status: 401 })

    const withinLimit = await checkRateLimit(keyRecord.id)
    if (!withinLimit) {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json({ status: false, message: 'Rate limit exceeded' }, { status: 429 })
    }

    const creditCost = 3
    const creditCheck = await hasEnoughCredits(keyRecord.userId, creditCost)
    if (!creditCheck.enough) {
      await updateKeyStats(keyRecord.id, false)
      return NextResponse.json({ status: false, message: 'Insufficient credits', remaining: creditCheck.available }, { status: 402 })
    }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')

    if (!url) return NextResponse.json({ status: false, message: 'url parameter required' }, { status: 400 })
    if (!url.includes('pinterest.com') && !url.includes('pin.it')) {
      return NextResponse.json({ status: false, message: 'Invalid Pinterest URL' }, { status: 400 })
    }

    const result = await cobaltDownload({ url })

    if (result.status === 'error') {
      return NextResponse.json({ status: false, message: result.error?.context || result.error?.code || 'Download failed' }, { status: 502 })
    }

    let downloadUrl = ''
    let filename = result.filename || ''

    if (result.status === 'tunnel' || result.status === 'redirect') {
      downloadUrl = result.url || ''
      filename = filename || result.output?.filename || 'pinterest_download'
    } else if (result.status === 'picker' && result.picker && result.picker.length > 0) {
      downloadUrl = result.picker[0].url
      filename = filename || 'pinterest_download'
    }

    await prisma.apiLog.create({
      data: {
        keyId: keyRecord.id, userId: keyRecord.userId,
        endpoint: '/api/tools/pinterest-dl', method: 'GET', statusCode: 200,
        costCredits: creditCost,
        ip: request.headers.get('x-forwarded-for') || '',
        userAgent: request.headers.get('user-agent') || ''
      }
    })
    await deductCredits(keyRecord.userId, creditCost)
    await updateKeyStats(keyRecord.id, true)

    const user = await prisma.user.findUnique({ where: { id: keyRecord.userId }, select: { credits: true } })

    return NextResponse.json({
      status: true,
      data: {
        type: 'pinterest',
        originalUrl: url,
        downloadUrl: downloadUrl || undefined,
        filename: filename || undefined,
        costCredits: creditCost, remaining: user?.credits || 0
      }
    })
  } catch (error: any) {
    console.error('[pinterest-dl] error:', error?.message || error)
    return NextResponse.json({ status: false, message: error?.message || 'Internal server error' }, { status: 500 })
  }
}
