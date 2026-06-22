// src/app/api/tools/spotify/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'spotify', endpoint: '/api/tools/spotify', costCredits: 1 },
  async (req, { searchParams }) => {
    const url = searchParams.get('url')

    if (!url) throw new Error('url parameter required')

    if (!url.includes('open.spotify.com')) {
      throw new Error('Invalid Spotify URL')
    }

    // Extract track/album/playlist info from URL
    const match = url.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/)
    if (!match) {
      throw new Error('Could not parse Spotify URL')
    }

    const type = match[1]
    const id = match[2]

    // Use Spotify oEmbed API (no auth needed for basic info)
    const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`)
    const data = await response.json()

    return {
      type,
      id,
      title: data.title || '',
      artist: data.thumbnail_name?.split(' by ')[1] || '',
      thumbnail: data.thumbnail_url || '',
      embed: data.html || '',
      url
    }
  }
)
