import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'base-converter', endpoint: '/api/tools/base-converter', costCredits: 1 },
  async (req, { searchParams }) => {
    const number = searchParams.get('number')
    const from = parseInt(searchParams.get('from') || '')
    const to = parseInt(searchParams.get('to') || '')

    if (!number) throw new Error('number parameter required')
    if (!from || from < 2 || from > 36) throw new Error('from parameter required (2-36)')
    if (!to || to < 2 || to > 36) throw new Error('to parameter required (2-36)')

    const decimal = parseInt(number, from)
    if (isNaN(decimal)) throw new Error(`Invalid number for base ${from}`)

    const result = decimal.toString(to).toUpperCase()

    return {
      input: number,
      fromBase: from,
      toBase: to,
      decimal,
      result
    }
  }
)
