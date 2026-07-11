import { createPlugin } from '@/lib/plugin'
import crypto from 'crypto'

export const GET = createPlugin(
  { name: 'random-uuid', endpoint: '/api/tools/random-uuid', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(Math.max(parseInt(searchParams.get('count') || '1'), 1), 10)
    const uuids = Array.from({ length: count }, () => crypto.randomUUID())

    return { count, uuids }
  }
)
