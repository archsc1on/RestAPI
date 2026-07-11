import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'coin-flip', endpoint: '/api/tools/coin-flip', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(Math.max(parseInt(searchParams.get('count') || '1'), 1), 20)

    const results = Array.from({ length: count }, () => (Math.random() < 0.5 ? 'heads' : 'tails'))
    const heads = results.filter(r => r === 'heads').length
    const tails = results.length - heads

    return { count, results, heads, tails }
  }
)
