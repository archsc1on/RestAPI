import { NextRequest, NextResponse } from 'next/server'
import ytdl from '@distube/ytdl-core'
import { getApiKeyRecord, checkRateLimit, updateKeyStats, deductCredits, hasEnoughCredits } from '@/lib/api-key'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  try {
    const apiKey = request.headers.get('x-api-key')
    if (!apiKey) {
      return NextResponse.json({ status: false, message: 'API key required' }, { status: 401 })
    }

    const keyRecord = await getApiKeyRecord(apiKey)
    if (!keyRecord) {
      return NextResponse.json({ status: false, message: 'Invalid API key' }, { status: 401 })
    }

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
    const format = searchParams.get('format') || 'mp4'
    const quality = searchParams.get('quality') || '720'

    if (!url) {
      return NextResponse.json({ status: false, message: 'url parameter required' }, { status: 400 })
    }

    if (!ytdl.validateURL(url)) {
      return NextResponse.json({ status: false, message: 'Invalid YouTube URL' }, { status: 400 })
    }

    const info = await ytdl.getInfo(url)
    const videoId = info.videoDetails.videoId
    const title = info.videoDetails.title
    const author = info.videoDetails.author.name
    const thumbnail = info.videoDetails.thumbnails.pop()?.url || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    const duration = parseInt(info.videoDetails.lengthSeconds) || 0

    let downloadUrl = ''

    if (format === 'mp3') {
      const audioFormats = ytdl.filterFormats(info.formats, 'audioonly')
      const bestAudio = audioFormats.sort((a, b) => (b.audioBitrate || 0) - (a.audioBitrate || 0))[0]
      if (bestAudio?.url) {
        downloadUrl = bestAudio.url
      }
    } else {
      const videoFormats = ytdl.filterFormats(info.formats, 'videoandaudio')
      const filtered = videoFormats.filter(f => {
        const h = parseInt(f.qualityLabel || '0')
        return !isNaN(h) && h <= parseInt(quality)
      })
      const bestVideo = filtered.sort((a, b) => (b.height || 0) - (a.height || 0))[0] || videoFormats.sort((a, b) => (b.height || 0) - (a.height || 0))[0]
      if (bestVideo?.url) {
        downloadUrl = bestVideo.url
      }
    }

    if (!downloadUrl) {
      return NextResponse.json({ status: false, message: 'No suitable format found' }, { status: 404 })
    }

    await prisma.apiLog.create({
      data: {
        keyId: keyRecord.id,
        userId: keyRecord.userId,
        endpoint: '/api/tools/ytdl',
        method: 'GET',
        statusCode: 200,
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
        videoId,
        title,
        author,
        thumbnail,
        duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`,
        format,
        quality: `${quality}p`,
        downloadUrl,
        costCredits: creditCost,
        remaining: user?.credits || 0
      }
    })
  } catch (error: any) {
    console.error('[ytdl] error:', error?.message || error)
    return NextResponse.json(
      { status: false, message: error?.message || 'Failed to process YouTube video' },
      { status: 500 }
    )
  }
}
