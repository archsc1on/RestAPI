import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'space-news', endpoint: '/api/tools/space-news', costCredits: 1 },
  async (req, { searchParams }) => {
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20)

    const response = await fetch(
      `https://api.spaceflightnewsapi.net/v4/articles/?limit=${limit}&order=published_at&ordering=-published_at`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('Failed to fetch space news')

    const data = await response.json()
    const articles = (data.results || []).map((a: any) => ({
      title: a.title,
      summary: a.summary,
      url: a.url,
      imageUrl: a.image_url,
      publishedAt: a.published_at,
      source: a.news_site
    }))

    return { count: articles.length, articles }
  }
)
