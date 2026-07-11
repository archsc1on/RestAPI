import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'seasonal-anime', endpoint: '/api/tools/seasonal-anime', costCredits: 1 },
  async (req, { searchParams }) => {
    const year = searchParams.get('year') || new Date().getFullYear().toString()
    const season = searchParams.get('season') || 'spring'

    const response = await fetch(`https://api.jikan.moe/v4/seasons/${year}/${season}`)

    if (!response.ok) throw new Error('Failed to fetch seasonal anime')

    const data = await response.json()

    const results = (data.data || []).map((anime: any) => ({
      id: anime.mal_id,
      title: anime.title,
      titleJapanese: anime.title_japanese || '',
      type: anime.type,
      episodes: anime.episodes || '?',
      status: anime.status,
      score: anime.score,
      synopsis: anime.synopsis?.substring(0, 200) || '',
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
      url: anime.url,
      genres: (anime.genres || []).map((g: any) => g.name)
    }))

    return { year, season, total: results.length, results }
  }
)
