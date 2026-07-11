import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anime-news', endpoint: '/api/tools/anime-news', costCredits: 1 },
  async (req, { searchParams }) => {
    const limit = parseInt(searchParams.get('limit') || '5')

    const topRes = await fetch('https://api.jikan.moe/v4/top/anime?limit=5')
    if (!topRes.ok) throw new Error('Failed to fetch top anime')
    const topData = await topRes.json()
    const topAnime = topData.data || []

    const allNews: any[] = []
    for (const anime of topAnime) {
      await new Promise(r => setTimeout(r, 500))
      try {
        const newsRes = await fetch(`https://api.jikan.moe/v4/anime/${anime.mal_id}/news`)
        if (newsRes.ok) {
          const newsData = await newsRes.json()
          for (const news of (newsData.data || [])) {
            if (allNews.length >= limit) break
            allNews.push({
              id: news.mal_id,
              title: news.title,
              url: news.url,
              image: news.image_url || '',
              comments: news.comments || 0,
              date: news.date || '',
              anime: anime.title
            })
          }
        }
      } catch {}
      if (allNews.length >= limit) break
    }

    return { total: allNews.length, results: allNews }
  }
)
