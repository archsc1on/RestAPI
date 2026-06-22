// src/app/api/tools/yt-search/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getApiKeyRecord, checkRateLimit, updateKeyStats, deductCredits, hasEnoughCredits } from '@/lib/api-key'

interface YouTubeVideo {
  id: string
  title: string
  channel: string
  channelId: string
  description: string
  thumbnail: string
  duration: string
  viewCount: string
  publishedAt: string
  url: string
  embedUrl: string
}

async function searchYouTube(query: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  // If YouTube API key is configured, use official API
  if (apiKey) {
    try {
      const params = new URLSearchParams({
        part: 'snippet',
        q: query,
        type: 'video',
        maxResults: maxResults.toString(),
        key: apiKey
      })

      const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params}`)
      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status}`)
      }

      const data = await response.json()

      // Get video details for duration and stats
      const videoIds = data.items?.map((item: any) => item.id.videoId).join(',') || ''
      let videoDetails: any = {}

      if (videoIds) {
        const detailsParams = new URLSearchParams({
          part: 'contentDetails,statistics',
          id: videoIds,
          key: apiKey
        })

        const detailsResponse = await fetch(`https://www.googleapis.com/youtube/v3/videos?${detailsParams}`)
        if (detailsResponse.ok) {
          const detailsData = await detailsResponse.json()
          detailsData.items?.forEach((item: any) => {
            videoDetails[item.id] = {
              duration: item.contentDetails?.duration || '',
              viewCount: item.statistics?.viewCount || '0'
            }
          })
        }
      }

      return (data.items || []).map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channel: item.snippet.channelTitle,
        channelId: item.snippet.channelId,
        description: item.snippet.description,
        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
        duration: formatDuration(videoDetails[item.id.videoId]?.duration || ''),
        viewCount: formatNumber(parseInt(videoDetails[item.id.videoId]?.viewCount || '0')),
        publishedAt: item.snippet.publishedAt,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`,
        embedUrl: `https://www.youtube.com/embed/${item.id.videoId}`
      }))
    } catch (error) {
      console.error('YouTube API error:', error)
    }
  }

  // Fallback: Use YouTube search page scraping (limited)
  try {
    const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}&sp=EgIQAQ%3D%3D`
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (response.ok) {
      const html = await response.text()

      // Extract video data from page
      const videos: YouTubeVideo[] = []
      const videoRegex = /"videoId":"([^"]+)"/g
      const titleRegex = /"title":{"runs":\[{"text":"([^"]+)"}\]}/g

      let match
      const videoIds: string[] = []

      while ((match = videoRegex.exec(html)) !== null && videoIds.length < maxResults) {
        if (!videoIds.includes(match[1])) {
          videoIds.push(match[1])
        }
      }

      for (const videoId of videoIds) {
        videos.push({
          id: videoId,
          title: 'Video', // Would need more parsing for full details
          channel: '',
          channelId: '',
          description: '',
          thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
          duration: '',
          viewCount: '',
          publishedAt: '',
          url: `https://www.youtube.com/watch?v=${videoId}`,
          embedUrl: `https://www.youtube.com/embed/${videoId}`
        })
      }

      if (videos.length > 0) {
        return videos
      }
    }
  } catch (error) {
    console.error('YouTube scraping fallback error:', error)
  }

  return []
}

function formatDuration(iso8601: string): string {
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return ''

  const hours = parseInt(match[1] || '0')
  const minutes = parseInt(match[2] || '0')
  const seconds = parseInt(match[3] || '0')

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

function formatNumber(num: number): string {
  if (num >= 1000000000) return (num / 1000000000).toFixed(1) + 'B'
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
  return num.toString()
}

// GET /api/tools/yt-search?q=query&limit=10
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

    // Credit check (2 credits per search)
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
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 50)

    if (!query || query.trim().length === 0) {
      return NextResponse.json(
        { status: false, message: 'Search query (q) is required' },
        { status: 400 }
      )
    }

    const results = await searchYouTube(query.trim(), limit)

    // Log and deduct
    await prisma.apiLog.create({
      data: {
        keyId: keyRecord.id,
        userId: keyRecord.userId,
        endpoint: '/api/tools/yt-search',
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
        query,
        totalResults: results.length,
        results,
        costCredits: creditCost,
        remaining: remaining?.credits || 0
      }
    })
  } catch (error) {
    console.error('YouTube search API error:', error)
    return NextResponse.json(
      { status: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}
