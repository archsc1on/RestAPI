import { createPlugin } from '@/lib/plugin'

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
  { name: 'sound-fx', endpoint: '/api/tools/sound-fx', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')
    if (!q) throw new Error('q parameter required')

    const token = process.env.FREESOUND_API_KEY || ''
    if (!token) {
      return {
        query: q,
        total: 0,
        results: [],
        message: 'Freesound API key not configured. Set FREESOUND_API_KEY environment variable to use this endpoint.',
        docs: 'https://freesound.org/docs/api/overview/'
      }
    }

    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch(
          `https://freesound.org/apiv2/search/text/?query=${encodeURIComponent(q)}&token=${token}&page_size=10`,
          { signal: AbortSignal.timeout(10000) }
        )
        if (!response.ok) throw new Error('Failed to search sound effects')
        return response.json()
      })

      const results = (data.results || []).map((sfx: any) => ({
        id: sfx.id, name: sfx.name || '', description: sfx.description || '',
        duration: sfx.duration || 0, tags: sfx.tags || [], url: sfx.url || '',
        preview: sfx.previews?.['preview-hq-mp3'] || sfx.previews?.['preview-lq-mp3'] || '',
        username: sfx.username || '', downloads: sfx.num_downloads || 0
      }))

      return { query: q, total: results.length, results }
    } catch {
      return { query: q, total: 0, results: [], note: 'Freesound API unavailable, please try again later' }
    }
  }
)
