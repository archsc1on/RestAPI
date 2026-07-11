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
  { name: 'movie-detail', endpoint: '/api/tools/movie-detail', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required')

    const apiKey = process.env.OMDB_API_KEY || ''
    if (!apiKey) {
      return {
        message: 'OMDB API key not configured. Set OMDB_API_KEY environment variable.',
        docs: 'http://www.omdbapi.com/apikey.aspx'
      }
    }

    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch(`https://www.omdbapi.com/?i=${id}&apikey=${apiKey}`, {
          signal: AbortSignal.timeout(10000)
        })
        if (!response.ok) throw new Error('OMDB request failed')
        return response.json()
      })

      if (data.Response === 'False') throw new Error(data.Error || 'Movie not found')

      return {
        title: data.Title || '', year: data.Year || '', rated: data.Rated || '',
        released: data.Released || '', runtime: data.Runtime || '', genre: data.Genre || '',
        director: data.Director || '', writer: data.Writer || '', actors: data.Actors || '',
        plot: data.Plot || '', language: data.Language || '', country: data.Country || '',
        awards: data.Awards || '', poster: data.Poster || '',
        imdbRating: data.imdbRating || '', imdbVotes: data.imdbVotes || '',
        imdbID: data.imdbID || '', type: data.Type || '', dvd: data.DVD || '',
        boxOffice: data.BoxOffice || '', ratings: data.Ratings || []
      }
    } catch (e: any) {
      if (e.message?.includes('not found')) throw new Error(`Movie with ID "${id}" not found`)
      return { note: 'OMDB API is currently unreachable. Please try again later.' }
    }
  }
)
