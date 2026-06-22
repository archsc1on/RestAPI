// src/app/api/tools/shorturl/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'shorturl', endpoint: '/api/tools/shorturl', costCredits: 1 },
  async (req, { searchParams }) => {
    const url = searchParams.get('url')

    if (!url) throw new Error('url parameter required')

    try {
      new URL(url)
    } catch {
      throw new Error('Invalid URL format')
    }

    // Use cleanuri API (free, no key needed)
    const response = await fetch('https://cleanuri.com/api/v1/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `url=${encodeURIComponent(url)}`
    })

    const data = await response.json()

    if (data.error) {
      throw new Error(data.error)
    }

    return {
      original: url,
      short: data.result_url,
      provider: 'cleanuri.com'
    }
  }
)
