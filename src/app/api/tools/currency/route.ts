import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'currency', endpoint: '/api/tools/currency', costCredits: 1 },
  async (req, { searchParams }) => {
    const from = (searchParams.get('from') || 'USD').toUpperCase()
    const to = (searchParams.get('to') || 'IDR').toUpperCase()
    const amount = parseFloat(searchParams.get('amount') || '1')

    if (from === to) {
      return { from, to, amount, result: amount, rate: 1 }
    }

    try {
      const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`)
      if (response.ok) {
        const data = await response.json()
        const rate = data.rates?.[to]
        if (rate) {
          return {
            from,
            to,
            amount,
            rate,
            result: Math.round(amount * rate * 100) / 100,
            date: data.date || new Date().toISOString().split('T')[0]
          }
        }
      }
    } catch {}

    throw new Error(`Exchange rate not available for ${from} to ${to}`)
  }
)
