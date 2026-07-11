import { createPlugin } from '@/lib/plugin'

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn() } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

const FALLBACK_QUOTES = [
  { content: 'The only way to do great work is to love what you do.', author: 'Steve Jobs', tags: ['motivation'] },
  { content: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', tags: ['innovation'] },
  { content: 'Life is what happens when you\'re busy making other plans.', author: 'John Lennon', tags: ['life'] },
  { content: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', tags: ['dreams'] },
  { content: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle', tags: ['perseverance'] }
]

export const GET = createPlugin(
  { name: 'quotes', endpoint: '/api/tools/quotes', costCredits: 1 },
  async (req, { searchParams }) => {
    const category = searchParams.get('category') || ''
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 5)

    try {
      let url = `https://api.quotable.io/quotes?limit=${count}`
      if (category) url += `&tags=${encodeURIComponent(category)}`

      const data = await fetchWithRetry(async () => {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
        if (!response.ok) throw new Error('Quotable API failed')
        return response.json()
      })

      return {
        total: data.totalCount || 0,
        quotes: (data.results || []).map((q: any) => ({
          content: q.content, author: q.author, tags: q.tags || []
        }))
      }
    } catch {
      const shuffled = [...FALLBACK_QUOTES].sort(() => Math.random() - 0.5)
      return {
        total: shuffled.length,
        quotes: shuffled.slice(0, count),
        note: 'Quotable API unavailable, using built-in quotes'
      }
    }
  }
)
