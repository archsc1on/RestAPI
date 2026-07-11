import { createPlugin } from '@/lib/plugin'

const DIRECTIONS: Record<string, string> = {
  'to-right': 'to right',
  'to-left': 'to left',
  'to-top': 'to top',
  'to-bottom': 'to bottom',
  'to-top-right': 'to top right',
  'to-bottom-left': 'to bottom left',
}

export const GET = createPlugin(
  { name: 'gradient', endpoint: '/api/tools/gradient', costCredits: 1 },
  async (req, { searchParams }) => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (!from || !to) throw new Error('from and to are required')

    const direction = DIRECTIONS[searchParams.get('direction') || 'to-right'] || 'to right'
    const css = `linear-gradient(${direction}, ${from}, ${to})`

    return { from, to, direction, css }
  }
)
