import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'product-hunt', endpoint: '/api/tools/product-hunt', costCredits: 1 },
  async (req, { searchParams }) => {
    const response = await fetch('https://www.producthunt.com/frontend/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'RESTAPI-XENDIT/1.0'
      },
      body: JSON.stringify({
        query: `{ posts(order: RANKING, first: 10) { edges { node { name tagline votesCount url } } } }`
      }),
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      return {
        message: 'Product Hunt API requires authentication',
        note: 'Top products are available via their GraphQL API with a token'
      }
    }

    const data = await response.json()
    const products = (data?.data?.posts?.edges || []).map((e: any) => ({
      name: e.node.name,
      tagline: e.node.tagline,
      votes: e.node.votesCount,
      url: e.node.url
    }))

    return { count: products.length, products }
  }
)
