import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'movie', endpoint: '/api/tools/movie', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    const type = searchParams.get('type') || 'movie'

    if (!query) throw new Error('q (query) parameter required')

    const apiKey = process.env.OMDB_API_KEY || ''
    if (!apiKey) throw new Error('OMDB API key not configured')

    const response = await fetch(
      `https://www.omdbapi.com/?s=${encodeURIComponent(query)}&type=${type}&apikey=${apiKey}`
    )
    if (!response.ok) throw new Error('Search failed')

    const data = await response.json()
    if (data.Response === 'False') throw new Error(data.Error || 'No results found')

    const results = (data.Search || []).map((m: any) => ({
      id: m.imdbID,
      title: m.Title,
      year: m.Year,
      type: m.Type,
      poster: m.Poster !== 'N/A' ? m.Poster : '',
      imdbUrl: `https://www.imdb.com/title/${m.imdbID}`
    }))

    return { query, total: results.length, results }
  }
)
