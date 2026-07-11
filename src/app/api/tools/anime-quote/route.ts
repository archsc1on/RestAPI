import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anime-quote', endpoint: '/api/tools/anime-quote', costCredits: 1 },
  async () => {
    const response = await fetch('https://api.jikan.moe/v4/random/anime')

    if (!response.ok) throw new Error('Failed to fetch random anime')

    const data = await response.json()
    const anime = data.data

    return {
      anime: anime.title || '',
      japaneseTitle: anime.title_japanese || '',
      synopsis: anime.synopsis || '',
      score: anime.score || 0,
      type: anime.type || '',
      episodes: anime.episodes || 0,
      url: anime.url || ''
    }
  }
)
