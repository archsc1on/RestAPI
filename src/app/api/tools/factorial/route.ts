import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'factorial', endpoint: '/api/tools/factorial', costCredits: 1 },
  async (req, { searchParams }) => {
    const number = parseInt(searchParams.get('number') || '')

    if (isNaN(number) || number < 0) throw new Error('number parameter required (>= 0)')
    if (number > 170) throw new Error('Number too large (max 170)')

    let result = 1
    for (let i = 2; i <= number; i++) {
      result *= i
    }

    return { number, factorial: result }
  }
)
