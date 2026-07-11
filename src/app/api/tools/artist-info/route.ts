import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'artist-info', endpoint: '/api/tools/artist-info', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')
    if (!q) throw new Error('q parameter required')

    const searchRes = await fetch(`https://api.deezer.com/search/artist?q=${encodeURIComponent(q)}&limit=1`)

    if (!searchRes.ok) throw new Error('Failed to search artist')

    const searchData = await searchRes.json()
    const artist = searchData.data?.[0]
    if (!artist) throw new Error('Artist not found')

    const detailRes = await fetch(`https://api.deezer.com/artist/${artist.id}`)

    if (!detailRes.ok) throw new Error('Failed to fetch artist details')

    const detail = await detailRes.json()

    return {
      id: detail.id,
      name: detail.name || '',
      picture: detail.picture_medium || '',
      nbAlbums: detail.nb_album || 0,
      nbFans: detail.nb_fan || 0,
      link: detail.link || '',
      radio: detail.radio || false
    }
  }
)
