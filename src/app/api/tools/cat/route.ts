import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'cat', endpoint: '/api/tools/cat', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 5)

    try {
      const results: any[] = []
      for (let i = 0; i < count; i++) {
        const response = await fetch('https://api.thecatapi.com/v1/images/search')
        if (response.ok) {
          const data = await response.json()
          if (data[0]) {
            results.push({
              url: data[0].url,
              width: data[0].width,
              height: data[0].height,
              id: data[0].id
            })
          }
        }
      }

      return { count: results.length, cats: results }
    } catch {
      throw new Error('Failed to fetch cat images')
    }
  }
)
