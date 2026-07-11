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
  { name: 'tv-show', endpoint: '/api/tools/tv-show', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')
    if (!q) throw new Error('q parameter required')

    const apiKey = process.env.OMDB_API_KEY || ''
    if (!apiKey) {
      return {
        query: q, totalResults: 0, results: [],
        message: 'OMDB API key not configured. Set OMDB_API_KEY environment variable.',
        docs: 'http://www.omdbapi.com/apikey.aspx'
      }
    }

    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(q)}&type=series&apikey=${apiKey}`, {
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) throw new Error('OMDB request failed')
        return response.json()
      })

      if (data.Response === 'False') throw new Error(data.Error || 'No results found')

      const results = (data.Search || []).map((show: any) => ({
        title: show.Title || '', year: show.Year || '', imdbID: show.imdbID || '',
        type: show.Type || '', poster: show.Poster || ''
      }))

      return { query: q, totalResults: parseInt(data.totalResults || '0'), results }
    } catch (e: any) {
      if (e.message === 'No results found' || e.message?.includes('not found')) {
        throw new Error(`No TV shows found for "${q}"`)
      }
      return {
        query: q, totalResults: 0, results: [],
        note: 'OMDB API is currently unreachable. Please try again later.'
      }
    }
  }
)
