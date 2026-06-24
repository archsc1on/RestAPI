import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'crypto', endpoint: '/api/tools/crypto', costCredits: 1 },
  async (req, { searchParams }) => {
    const coin = searchParams.get('coin') || 'bitcoin'

    const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(coin)}&vs_currencies=usd,idr&include_24hr_change=true`)
    if (!response.ok) throw new Error('Cryptocurrency not found')

    const data = await response.json()
    const coinData = data[coin]

    if (!coinData) throw new Error(`Coin "${coin}" not found. Try: bitcoin, ethereum, solana, dogecoin`)

    return {
      coin,
      price: {
        usd: coinData.usd,
        idr: coinData.idr
      },
      change24h: {
        usd: coinData.usd_24h_change ? Math.round(coinData.usd_24h_change * 100) / 100 : 0,
        idr: coinData.idr_24h_change ? Math.round(coinData.idr_24h_change * 100) / 100 : 0
      },
      note: 'CoinGecko free API. Try: bitcoin, ethereum, solana, dogecoin, cardano, ripple'
    }
  }
)
