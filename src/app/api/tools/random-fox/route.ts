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

export const GET = createPlugin(
  { name: 'random-fox', endpoint: '/api/tools/random-fox', costCredits: 1 },
  async (req, { searchParams }) => {
    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch('https://randomfox.ca/floof/', {
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) throw new Error('Failed to fetch fox image')
        return response.json()
      })
      return { url: data.image }
    } catch {
      return {
        url: 'https://i.imgur.com/6RJYBRw.jpeg',
        note: 'randomfox.ca API unavailable, using placeholder image'
      }
    }
  }
)
