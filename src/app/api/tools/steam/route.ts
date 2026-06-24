import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'steam', endpoint: '/api/tools/steam', costCredits: 1 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    if (!query) throw new Error('q (query) parameter required')

    const response = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(query)}&l=english&cc=US`
    )
    if (!response.ok) throw new Error('Failed to search Steam')

    const data = await response.json()
    const results = (data.items || []).map((item: any) => ({
      id: item.id,
      name: item.name,
      developer: item.developer || '',
      publisher: item.publisher || '',
      price: item.price ? `$${(item.price.final / 100).toFixed(2)}` : 'Free',
      discount: item.price?.discount_percent ? `${item.price.discount_percent}% off` : 'none',
      isFree: item.is_free || false,
      headerImage: item.header_image || '',
      url: `https://store.steampowered.com/app/${item.id}`
    }))

    return { query, total: results.length, results }
  }
)
