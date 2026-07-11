import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anime-genres', endpoint: '/api/tools/anime-genres', costCredits: 1 },
  async () => {
    const response = await fetch('https://api.jikan.moe/v4/genres/anime')

    if (!response.ok) throw new Error('Failed to fetch anime genres')

    const data = await response.json()

    const results = (data.data || []).map((genre: any) => ({
      id: genre.mal_id,
      name: genre.name,
      count: genre.count || 0,
      url: genre.url || ''
    }))

    return { total: results.length, results }
  }
)
