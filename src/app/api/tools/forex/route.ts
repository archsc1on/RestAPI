import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'forex', endpoint: '/api/tools/forex', costCredits: 1 },
  async (req, { searchParams }) => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from) throw new Error('from parameter required')
    if (!to) throw new Error('to parameter required')

    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from.toUpperCase()}`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('Failed to fetch exchange rate')

    const data = await response.json()
    const rate = data.rates?.[to.toUpperCase()]

    if (!rate) throw new Error(`Currency ${to} not found`)

    return {
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      rate,
      date: data.date,
      inverse: (1 / rate).toFixed(6)
    }
  }
)
