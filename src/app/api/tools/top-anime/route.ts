import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'top-anime', endpoint: '/api/tools/top-anime', costCredits: 1 },
  async (req, { searchParams }) => {
    const filter = searchParams.get('filter') || 'bypopularity'
    const limit = parseInt(searchParams.get('limit') || '5')

    const response = await fetch(`https://api.jikan.moe/v4/top/anime?filter=${filter}&limit=${limit}`)

    if (!response.ok) throw new Error('Failed to fetch top anime')

    const data = await response.json()

    const results = (data.data || []).map((anime: any) => ({
      id: anime.mal_id,
      title: anime.title,
      titleJapanese: anime.title_japanese || '',
      type: anime.type,
      episodes: anime.episodes || '?',
      status: anime.status,
      score: anime.score,
      rank: anime.rank,
      synopsis: anime.synopsis?.substring(0, 200) || '',
      image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url || '',
      url: anime.url,
      genres: (anime.genres || []).map((g: any) => g.name)
    }))

    return { filter, total: results.length, results }
  }
)
