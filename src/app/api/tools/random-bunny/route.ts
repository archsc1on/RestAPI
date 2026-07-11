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
  { name: 'random-bunny', endpoint: '/api/tools/random-bunny', costCredits: 1 },
  async (req, { searchParams }) => {
    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch('https://bunnies.io/api/bunny-image', {
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) throw new Error('bunnies.io API returned error')
        return response.json()
      })
      if (data.url) return { url: data.url }
    } catch {}

    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch('https://api.thecatapi.com/v1/images/search?limit=1', {
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) throw new Error('cat API failed')
        return response.json()
      })
      return {
        url: data[0]?.url || '',
        note: 'bunnies.io unavailable, using cat image as fallback'
      }
    } catch {}

    return {
      url: 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400',
      note: 'All APIs unavailable, using placeholder image'
    }
  }
)
