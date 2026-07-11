import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'stock', endpoint: '/api/tools/stock', costCredits: 1 },
  async (req, { searchParams }) => {
    const symbol = searchParams.get('symbol')

    if (!symbol) throw new Error('symbol parameter required')

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('Failed to fetch stock data')

    const data = await response.json()
    const result = data.chart?.result?.[0]
    if (!result) throw new Error('No stock data found')

    const meta = result.meta
    return {
      symbol: meta.symbol,
      name: meta.shortName || meta.symbol,
      currency: meta.currency,
      price: meta.regularMarketPrice,
      previousClose: meta.previousClose,
      change: meta.regularMarketPrice - meta.previousClose,
      changePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose * 100).toFixed(2),
      marketState: meta.marketState
    }
  }
)
