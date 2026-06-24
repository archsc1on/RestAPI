import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'dog', endpoint: '/api/tools/dog', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 5)

    const results: any[] = []
    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch('https://dog.ceo/api/breeds/image/random')
        if (response.ok) {
          const data = await response.json()
          if (data.status === 'success') {
            results.push({ url: data.message })
          }
        }
      } catch {}
    }

    if (results.length === 0) throw new Error('Failed to fetch dog images')

    return { count: results.length, dogs: results }
  }
)
