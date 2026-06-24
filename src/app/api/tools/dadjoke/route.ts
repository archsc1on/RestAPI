import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'dadjoke', endpoint: '/api/tools/dadjoke', costCredits: 1 },
  async (req, { searchParams }) => {
    const response = await fetch('https://icanhazdadjoke.com/', {
      headers: { 'Accept': 'application/json' }
    })

    if (!response.ok) throw new Error('Failed to fetch joke')

    const data = await response.json()
    return {
      joke: data.joke || '',
      id: data.id || '',
      source: 'icanhazdadjoke.com'
    }
  }
)
