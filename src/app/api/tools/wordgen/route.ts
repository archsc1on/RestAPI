import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'wordgen', endpoint: '/api/tools/wordgen', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = parseInt(searchParams.get('count') || '5')
    const length = parseInt(searchParams.get('length') || '8')
    const chars = 'abcdefghijklmnopqrstuvwxyz'

    const words = Array.from({ length: count }, () => {
      return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
    })

    return { count, length, words }
  }
)
