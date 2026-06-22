// src/app/api/tools/anime/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anime', endpoint: '/api/tools/anime', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')

    if (!query) throw new Error('q (query) parameter required')

    // Use Jikan API (MyAnimeList unofficial)
    const response = await fetch(`https://api.jikan.moe/v4/anime?q=${encodeURIComponent(query)}&limit=5`)

    if (!response.ok) {
      throw new Error('Failed to search anime')
    }

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

    return {
      query,
      total: results.length,
      results
    }
  }
)
