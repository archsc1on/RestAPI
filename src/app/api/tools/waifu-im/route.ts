import { createPlugin } from '@/lib/plugin'

const WAIFU_API = process.env.WAIFU_API_URL || 'https://api.waifu.im'
const WAIFU_KEY = process.env.WAIFU_API_KEY || ''

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn() } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

export const GET = createPlugin(
  { name: 'waifu-im', endpoint: '/api/tools/waifu-im', costCredits: 1 },
  async (req, { searchParams }) => {
    const tags = searchParams.get('tags') || 'waifu'
    const limit = Math.min(parseInt(searchParams.get('limit') || '1'), 10)
    const page = parseInt(searchParams.get('page') || '1')

    const params = new URLSearchParams({
      PageSize: limit.toString(),
      Page: page.toString(),
      IncludedTags: tags,
    })

    try {
      const data = await fetchWithRetry(async () => {
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 15000)
        try {
          const response = await fetch(`${WAIFU_API}/images?${params}`, {
            headers: { 'X-Api-Key': WAIFU_KEY },
            signal: controller.signal,
          })
          if (!response.ok) throw new Error('Failed to fetch from waifu.im')
          return response.json()
        } finally {
          clearTimeout(timeout)
        }
      })

      const images = (data.items || []).map((img: any) => ({
        id: img.id,
        url: img.url,
        width: img.width,
        height: img.height,
        favorite: img.favorites,
        dominantColor: img.dominantColor,
        tags: img.tags?.map((t: any) => t.name) || [],
        source: img.source || '',
        isNsfw: img.isNsfw,
        artist: img.artists?.[0]?.name || '',
      }))

      return {
        count: images.length,
        page: data.pageNumber,
        totalPages: data.totalPages,
        images,
      }
    } catch {
      return {
        count: 0,
        images: [],
        note: 'waifu.im API is currently unreachable. Please try again later.',
      }
    }
  }
)
