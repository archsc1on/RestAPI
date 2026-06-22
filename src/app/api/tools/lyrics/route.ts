// src/app/api/tools/lyrics/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'lyrics', endpoint: '/api/tools/lyrics', costCredits: 1 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')

    if (!query) throw new Error('q (query) parameter required')

    // Use lrclib.net (free lyrics API)
    const response = await fetch(`https://lrclib.net/api/search?q=${encodeURIComponent(query)}`)

    if (!response.ok) {
      throw new Error('No lyrics found')
    }

    const data = await response.json()

    if (!data || data.length === 0) {
      throw new Error('No lyrics found for this query')
    }

    const track = data[0]

    return {
      title: track.trackName,
      artist: track.artistName,
      album: track.albumName || '',
      duration: track.duration,
      lyrics: track.plainLyrics || track.syncedLyrics || 'Lyrics not available',
      source: 'lrclib.net'
    }
  }
)
