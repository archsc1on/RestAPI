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
  { name: 'movie', endpoint: '/api/tools/movie', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'movie'

    if (!query) throw new Error('q (query) parameter required')

    const apiKey = process.env.OMDB_API_KEY || ''
    if (!apiKey) {
      return {
        query, total: 0, results: [],
        message: 'OMDB API key not configured. Set OMDB_API_KEY environment variable.',
        docs: 'http://www.omdbapi.com/apikey.aspx'
      }
    }

    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch(
          `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=${type}&apikey=${apiKey}`,
          { signal: AbortSignal.timeout(10000) }
        )
        if (!response.ok) throw new Error('OMDB search failed')
        return response.json()
      })

      if (data.Response === 'False') throw new Error(data.Error || 'No results found')

      const results = (data.Search || []).map((m: any) => ({
        id: m.imdbID, title: m.Title, year: m.Year, type: m.Type,
        poster: m.Poster !== 'N/A' ? m.Poster : '',
        imdbUrl: `https://www.imdb.com/title/${m.imdbID}`
      }))

      return { query, total: results.length, results }
    } catch (e: any) {
      if (e.message === 'No results found' || e.message?.includes('not found')) {
        throw new Error(`No results found for "${query}"`)
      }
      return {
        query, total: 0, results: [],
        note: 'OMDB API is currently unreachable. Please try again later.'
      }
    }
  }
)
