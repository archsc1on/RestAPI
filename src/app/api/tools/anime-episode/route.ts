import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anime-episode', endpoint: '/api/tools/anime-episode', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required')
    const page = parseInt(searchParams.get('page') || '1')

    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/episodes?page=${page}`)

    if (!response.ok) throw new Error('Failed to fetch anime episodes')

    const data = await response.json()

    const results = (data.data || []).map((ep: any) => ({
      id: ep.mal_id,
      number: ep.number,
      title: ep.title || '',
      titleJapanese: ep.title_japanese || '',
      duration: ep.duration || 0,
      aired: ep.aired || '',
      score: ep.score || null,
      synopsis: ep.synopsis || '',
      filler: ep.filler || false,
      recap: ep.recap || false
    }))

    return { page, total: results.length, pagination: data.pagination || {}, results }
  }
)
