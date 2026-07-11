import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'prime-check', endpoint: '/api/tools/prime-check', costCredits: 1 },
  async (req, { searchParams }) => {
    const number = parseInt(searchParams.get('number') || '')

    if (isNaN(number)) throw new Error('number parameter required')

    if (number < 2) return { number, isPrime: false }

    if (number === 2) return { number, isPrime: true }

    if (number % 2 === 0) return { number, isPrime: false }

    for (let i = 3; i <= Math.sqrt(number); i += 2) {
      if (number % i === 0) return { number, isPrime: false }
    }

    return { number, isPrime: true }
  }
)
