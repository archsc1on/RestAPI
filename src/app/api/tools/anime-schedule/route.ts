import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anime-schedule', endpoint: '/api/tools/anime-schedule', costCredits: 2 },
  async (req, { searchParams }) => {
    const day = searchParams.get('day')
    const filter = searchParams.get('filter')

    let url = `https://api.jikan.moe/v4/schedules?limit=25`
    if (day) {
      url += `&day=${day.toLowerCase()}`
    }

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch schedule')

    const data = await response.json()
    const results = (data.data || []).map((anime: any) => ({
      id: anime.mal_id,
      title: anime.title,
      titleJapanese: anime.title_japanese || '',
      type: anime.type,
      score: anime.score,
      image: anime.images?.jpg?.image_url || '',
      broadcast: anime.broadcast?.string || '',
      day: anime.broadcast?.day || '',
      time: anime.broadcast?.time || '',
      timezone: anime.broadcast?.timezone || '',
      url: anime.url
    }))

    return {
      day: day || 'all',
      filter,
      total: results.length,
      results
    }
  }
)
