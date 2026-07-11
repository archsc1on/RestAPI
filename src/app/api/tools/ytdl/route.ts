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
    if (!withinLimit) { await updateKeyStats(keyRecord.id, false); return NextResponse.json({ status: false, message: 'Rate limit exceeded' }, { status: 429 }) }
    const creditCost = 3
    const creditCheck = await hasEnoughCredits(keyRecord.userId, creditCost)
    if (!creditCheck.enough) { await updateKeyStats(keyRecord.id, false); return NextResponse.json({ status: false, message: 'Insufficient credits', remaining: creditCheck.available }, { status: 402 }) }

    const { searchParams } = new URL(request.url)
    const url = searchParams.get('url')
    const format = searchParams.get('format') || 'mp4'
    const quality = searchParams.get('quality') || '1080'

    if (!url) return NextResponse.json({ status: false, message: 'url parameter required' }, { status: 400 })
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      return NextResponse.json({ status: false, message: 'Invalid YouTube URL' }, { status: 400 })
    }

    const result = await cobaltDownload({
      url,
      downloadMode: format === 'mp3' ? 'audio' : 'auto',
      videoQuality: quality,
      audioFormat: format === 'mp3' ? 'mp3' : undefined,
    })

    if (result.status === 'error') {
      return NextResponse.json({ status: false, message: result.error?.code || 'Download failed' }, { status: 400 })
    }

    await prisma.apiLog.create({ data: { keyId: keyRecord.id, userId: keyRecord.userId, endpoint: '/api/tools/ytdl', method: 'GET', statusCode: 200, costCredits: creditCost, ip: request.headers.get('x-forwarded-for') || '', userAgent: request.headers.get('user-agent') || '' } })
    await deductCredits(keyRecord.userId, creditCost)
    await updateKeyStats(keyRecord.id, true)
    const user = await prisma.user.findUnique({ where: { id: keyRecord.userId }, select: { credits: true } })

    return NextResponse.json({
      status: true,
      data: {
        type: 'youtube',
        originalUrl: url,
        downloadUrl: result.url,
        filename: result.filename,
        format,
        quality: `${quality}p`,
        costCredits: creditCost,
        remaining: user?.credits || 0,
      }
    })
  } catch (error: any) {
    return NextResponse.json({ status: false, message: error?.message || 'Failed to process video' }, { status: 500 })
  }
}
