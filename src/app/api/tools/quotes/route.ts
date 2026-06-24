import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'quotes', endpoint: '/api/tools/quotes', costCredits: 1 },
  async (req, { searchParams }) => {
    const category = searchParams.get('category') || ''
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 5)

    try {
      let url = `https://api.quotable.io/quotes?limit=${count}`
      if (category) url += `&tags=${encodeURIComponent(category)}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        return {
          total: data.totalCount || 0,
          quotes: (data.results || []).map((q: any) => ({
            content: q.content,
            author: q.author,
            tags: q.tags || []
          }))
        }
      }
    } catch {}

    const fallbackQuotes = [
      { content: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', tags: ['motivation'] },
      { content: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', tags: ['innovation'] },
      { content: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon', tags: ['life'] }
    ]

    return {
      total: fallbackQuotes.length,
      quotes: fallbackQuotes.slice(0, count),
      note: 'Fallback quotes'
    }
  }
)
