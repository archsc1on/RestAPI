import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'music-search', endpoint: '/api/tools/music-search', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')
    if (!q) throw new Error('q parameter required')

    const response = await fetch(`https://api.deezer.com/search?q=${encodeURIComponent(q)}&limit=10`)

    if (!response.ok) throw new Error('Failed to search music')

    const data = await response.json()

    const results = (data.data || []).map((track: any) => ({
      id: track.id,
      title: track.title || '',
      artist: track.artist?.name || '',
      album: track.album?.title || '',
      duration: track.duration || 0,
      preview: track.preview || '',
      link: track.link || '',
      cover: track.album?.cover_medium || ''
    }))

    return { query: q, total: results.length, results }
  }
)
