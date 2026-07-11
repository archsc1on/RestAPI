import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'manga-genres', endpoint: '/api/tools/manga-genres', costCredits: 1 },
  async () => {
    const response = await fetch('https://api.jikan.moe/v4/genres/manga')

    if (!response.ok) throw new Error('Failed to fetch manga genres')

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
