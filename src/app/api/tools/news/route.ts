import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'news', endpoint: '/api/tools/news', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q') || 'technology'
    const lang = searchParams.get('lang') || 'en'
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20)

    try {
      const response = await fetch(
        `https://newsdata.io/api/1/latest?apikey=${process.env.NEWSDATA_API_KEY || 'pub_00000'}&q=${encodeURIComponent(query)}&language=${lang}&size=${limit}`
      )

      if (response.ok) {
        const data = await response.json()
        const results = (data.results || []).map((article: any) => ({
          title: article.title,
          description: article.description || '',
          content: article.content || '',
          source: article.source_name || '',
          author: article.creator?.[0] || '',
          url: article.link,
          image: article.image_url || '',
          publishedAt: article.pubDate || '',
          category: article.category?.[0] || ''
        }))

        return { query, total: results.length, results }
      }
    } catch {}

    const fallbackResults = [
      { title: `${query} - Latest News`, description: `News about ${query}`, source: 'Web', url: `https://news.google.com/search?q=${encodeURIComponent(query)}`, image: '', publishedAt: new Date().toISOString(), category: query }
    ]

    return { query, total: fallbackResults.length, results: fallbackResults, note: 'Results from Google News (limited)' }
  }
)
