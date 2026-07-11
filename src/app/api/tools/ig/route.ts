// src/app/api/tools/ig/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'ig', endpoint: '/api/tools/ig', costCredits: 2 },
  async (req, { searchParams }) => {
    const url = searchParams.get('url')

    if (!url) throw new Error('url parameter required')

    if (!url.includes('instagram.com')) {
      throw new Error('Invalid Instagram URL')
    }

    // Extract shortcode from Instagram URL
    const shortcodeMatch = url.match(/\/p\/([A-Za-z0-9_-]+)/)
    const usernameMatch = url.match(/instagram\.com\/([A-Za-z0-9_.]+)/)

    // Instagram oEmbed API - try both endpoints
    let data: any = null

    const oembedUrls = [
      `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`,
      `https://www.instagram.com/api/v1/oembed/?url=${encodeURIComponent(url)}`
    ]

    for (const oembedUrl of oembedUrls) {
      try {
        const response = await fetch(oembedUrl, {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          redirect: 'follow'
        })

        const contentType = response.headers.get('content-type') || ''
        if (response.ok && contentType.includes('application/json')) {
          data = await response.json()
          break
        }
      } catch {}
    }

    return {
      type: 'instagram',
      username: data?.author_name || usernameMatch?.[1] || '',
      thumbnail: data?.thumbnail_url || '',
      title: data?.title || '',
      html: data?.html || '',
      width: data?.width || 0,
      height: data?.height || 0,
      shortcode: shortcodeMatch?.[1] || '',
      url
    }
  }
)
