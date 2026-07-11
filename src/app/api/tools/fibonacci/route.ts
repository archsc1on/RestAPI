import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'fibonacci', endpoint: '/api/tools/fibonacci', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(Math.max(parseInt(searchParams.get('count') || '10'), 1), 100)

    const sequence = [0, 1]
    for (let i = 2; i < count; i++) {
      sequence.push(sequence[i - 1] + sequence[i - 2])
    }

    return { count, sequence: sequence.slice(0, count) }
  }
)
