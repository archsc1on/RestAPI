import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'random-number', endpoint: '/api/tools/random-number', costCredits: 1 },
  async (req, { searchParams }) => {
    const min = parseInt(searchParams.get('min') || '1')
    const max = parseInt(searchParams.get('max') || '100')

    if (min >= max) throw new Error('min must be less than max')

    const number = Math.floor(Math.random() * (max - min + 1)) + min

    return { min, max, number }
  }
)
