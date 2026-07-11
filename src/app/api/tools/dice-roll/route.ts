import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'dice-roll', endpoint: '/api/tools/dice-roll', costCredits: 1 },
  async (req, { searchParams }) => {
    const sides = Math.min(Math.max(parseInt(searchParams.get('sides') || '6'), 2), 100)
    const count = Math.min(Math.max(parseInt(searchParams.get('count') || '1'), 1), 20)

    const rolls = Array.from({ length: count }, () => Math.floor(Math.random() * sides) + 1)
    const total = rolls.reduce((sum, r) => sum + r, 0)

    return { sides, count, rolls, total }
  }
)
