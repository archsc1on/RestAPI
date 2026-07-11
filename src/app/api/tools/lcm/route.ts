import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'lcm', endpoint: '/api/tools/lcm', costCredits: 1 },
  async (req, { searchParams }) => {
    const a = parseInt(searchParams.get('a') || '')
    const b = parseInt(searchParams.get('b') || '')

    if (isNaN(a) || isNaN(b)) throw new Error('a and b parameters required')

    const gcd = (x: number, y: number): number => {
      x = Math.abs(x)
      y = Math.abs(y)
      while (y) {
        const t = y
        y = x % y
        x = t
      }
      return x
    }

    const lcmVal = Math.abs(a * b) / gcd(a, b)

    return { a, b, lcm: lcmVal }
  }
)
