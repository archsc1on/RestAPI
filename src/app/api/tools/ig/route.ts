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

    // Use Instagram oEmbed API (limited but works for public posts)
    const response = await fetch(
      `https://api.instagram.com/oembed/?url=${encodeURIComponent(url)}`
    )

    if (!response.ok) {
      throw new Error('Failed to fetch Instagram post data')
    }

    const data = await response.json()

    return {
      type: 'instagram',
      username: data.author_name || '',
      thumbnail: data.thumbnail_url || '',
      title: data.title || '',
      html: data.html || '',
      width: data.width,
      height: data.height,
      url
    }
  }
)
