import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anime-rec', endpoint: '/api/tools/anime-rec', costCredits: 1 },
  async (req, { searchParams }) => {
    const limit = parseInt(searchParams.get('limit') || '5')

    const response = await fetch('https://api.jikan.moe/v4/recommendations/anime')

    if (!response.ok) throw new Error('Failed to fetch anime recommendations')

    const data = await response.json()

    const results = (data.data || []).slice(0, limit).map((rec: any) => ({
      id: rec.entry?.mal_id,
      title: rec.entry?.name || rec.entry?.title || '',
      url: rec.entry?.url || '',
      image: rec.entry?.images?.jpg?.image_url || '',
      recommendation: rec.content || '',
      recommendationsCount: rec.votes || 0
    }))

    return { total: results.length, results }
  }
)
