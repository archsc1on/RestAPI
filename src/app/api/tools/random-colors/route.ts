import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'random-colors', endpoint: '/api/tools/random-colors', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '5'), 20)
    const colors = Array.from({ length: count }, () => {
      const hex = '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')
      return hex
    })
    return { count, colors }
  }
)
