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

const BUILTIN_QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Innovation distinguishes between a leader and a follower.", author: "Steve Jobs" },
  { text: "Life is what happens when you're busy making other plans.", author: "John Lennon" },
  { text: "The future belongs to those who believe in the beauty of their dreams.", author: "Eleanor Roosevelt" },
  { text: "It is during our darkest moments that we must focus to see the light.", author: "Aristotle" },
  { text: "The best time to plant a tree was 20 years ago. The second best time is now.", author: "Chinese Proverb" },
  { text: "In the middle of difficulty lies opportunity.", author: "Albert Einstein" },
  { text: "Your time is limited, don't waste it living someone else's life.", author: "Steve Jobs" },
  { text: "If you look at what you have in life, you'll always have more.", author: "Oprah Winfrey" },
  { text: "If life were predictable it would cease to be life.", author: "Eleanor Roosevelt" }
]

export const GET = createPlugin(
  { name: 'random-quotes', endpoint: '/api/tools/random-quotes', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '5'), 10)

    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch(`https://api.quotable.io/quotes?limit=${count}`, {
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) throw new Error('Quotable API failed')
        return response.json()
      })

      if (data.results?.length > 0) {
        const quotes = data.results.map((q: any) => ({ text: q.content, author: q.author }))
        return { count: quotes.length, quotes }
      }
    } catch {}

    const selected = [...BUILTIN_QUOTES].sort(() => Math.random() - 0.5).slice(0, count)
    return { count: selected.length, quotes: selected, note: 'Quotable API unavailable, using built-in quotes' }
  }
)
