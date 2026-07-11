// src/app/api/tools/spotify/route.ts
import { createPlugin } from '@/lib/plugin'

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn() } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

export const GET = createPlugin(
  { name: 'spotify', endpoint: '/api/tools/spotify', costCredits: 1 },
  async (req, { searchParams }) => {
    const url = searchParams.get('url')
    const q = searchParams.get('q')

    if (!url && !q) throw new Error('url or q parameter required')

    if (url) {
      if (!url.includes('open.spotify.com')) {
        throw new Error('Invalid Spotify URL')
      }

      const match = url.match(/spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/)
      if (!match) {
        throw new Error('Could not parse Spotify URL')
      }

      const type = match[1]
      const id = match[2]

      try {
        const data = await fetchWithRetry(async () => {
          const response = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`, {
            signal: AbortSignal.timeout(10000)
          })
          if (!response.ok) throw new Error('oEmbed request failed')
          const text = await response.text()
          if (!text || text.length < 5) throw new Error('Empty oEmbed response')
          return JSON.parse(text)
        })

        return {
          type, id, title: data.title || '',
          artist: data.thumbnail_name?.split(' by ')[1] || '',
          thumbnail: data.thumbnail_url || '', embed: data.html || '', url
        }
      } catch {
        return {
          type, id, title: '', artist: '', thumbnail: '', embed: '', url,
          note: 'oEmbed API unavailable, returning parsed URL info only'
        }
      }
    }

    return {
      query: q,
      searchUrl: `https://open.spotify.com/search/${encodeURIComponent(q!)}`,
      message: 'Use the searchUrl to browse results on Spotify'
    }
  }
)
