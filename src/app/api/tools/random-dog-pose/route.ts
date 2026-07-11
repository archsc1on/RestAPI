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
  { name: 'random-dog-pose', endpoint: '/api/tools/random-dog-pose', costCredits: 1 },
  async (req, { searchParams }) => {
    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch('https://dog.ceo/api/breeds/image/random', {
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) throw new Error('Failed to fetch dog image')
        const json = await response.json()
        if (json.status !== 'success') throw new Error('API returned error')
        return json
      })

      const breed = data.message.split('/').slice(-2, -1)[0]
      return {
        url: data.message,
        breed: breed?.replace('-', ' ') || 'unknown'
      }
    } catch {
      return {
        url: 'https://images.dog.ceo/breeds/hound-english/n02089973_1.jpg',
        breed: 'english hound',
        note: 'dog.ceo API unavailable, using placeholder image'
      }
    }
  }
)
