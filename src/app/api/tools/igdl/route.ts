import { NextRequest, NextResponse } from 'next/server'
import { getApiKeyRecord, checkRateLimit, updateKeyStats, deductCredits, hasEnoughCredits } from '@/lib/api-key'
import { prisma } from '@/lib/prisma'

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
    if (!url.includes('instagram.com')) return NextResponse.json({ status: false, message: 'Invalid Instagram URL' }, { status: 400 })

    const shortCode = url.match(/instagram\.com\/(?:p|reel|tv|stories)\/([A-Za-z0-9_-]+)/)?.[1] || ''

    let author = ''
    let thumbnail = ''
    let title = ''
    try {
      const res = await fetch(`https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`)
      if (res.ok) {
        const data = await res.json()
        author = data.author_name || ''
        thumbnail = data.thumbnail_url || ''
        title = data.title || ''
      }
    } catch {}

    let downloadUrl = ''
    let error = ''

    try {
      const cobaltRes = await fetch('https://api.cobalt.tools/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify({ url, downloadMode: 'auto', filenameStyle: 'pretty' }),
        signal: AbortSignal.timeout(30000)
      })
      if (cobaltRes.ok) {
        const cobaltData = await cobaltRes.json()
        if (cobaltData.url) downloadUrl = cobaltData.url
      }
    } catch (e: any) {
      error = e?.message || 'Cobalt failed'
    }

    if (!downloadUrl) {
      return NextResponse.json({
        status: false,
        message: 'Could not generate download link. The service may be temporarily unavailable.',
        debug: process.env.NODE_ENV === 'development' ? error : undefined
      }, { status: 503 })
    }

    await prisma.apiLog.create({
      data: {
        keyId: keyRecord.id, userId: keyRecord.userId,
        endpoint: '/api/tools/igdl', method: 'GET', statusCode: 200,
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
        type: 'instagram', shortCode, author, title, thumbnail,
        originalUrl: url, downloadUrl,
        costCredits: creditCost, remaining: user?.credits || 0
      }
    })
  } catch (error: any) {
    console.error('[igdl] error:', error?.message || error)
    return NextResponse.json({ status: false, message: error?.message || 'Internal server error' }, { status: 500 })
  }
}
