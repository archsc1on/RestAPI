import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'album-art', endpoint: '/api/tools/album-art', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')
    if (!q) throw new Error('q parameter required')

    const response = await fetch(`https://api.deezer.com/search/album?q=${encodeURIComponent(q)}&limit=10`)

    if (!response.ok) throw new Error('Failed to search album art')

    const data = await response.json()

    const results = (data.data || []).map((album: any) => ({
      id: album.id,
      title: album.title || '',
      artist: album.artist?.name || '',
      cover: album.cover_medium || '',
      coverLarge: album.cover_xl || '',
      link: album.link || '',
      nbTracks: album.nb_tracks || 0
    }))

    return { query: q, total: results.length, results }
  }
)
