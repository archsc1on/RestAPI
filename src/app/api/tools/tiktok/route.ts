// src/app/api/tools/tiktok/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'tiktok', endpoint: '/api/tools/tiktok', costCredits: 2 },
  async (req, { searchParams }) => {
    const url = searchParams.get('url')

    if (!url) throw new Error('url parameter required')

    if (!url.includes('tiktok.com')) {
      throw new Error('Invalid TikTok URL')
    }

    // Use TikTok oEmbed API
    const response = await fetch(
      `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch TikTok video data')
    }

    const data = await response.json()

    return {
      type: 'tiktok',
      author: {
        username: data.author?.unique_id || '',
        nickname: data.author?.nickname || '',
        avatar: data.author?.avatar_url || ''
      },
      title: data.title || '',
      thumbnail: data.thumbnail_url || '',
      html: data.html || '',
      url
    }
  }
)
