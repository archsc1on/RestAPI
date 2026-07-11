import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'podcast', endpoint: '/api/tools/podcast', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')
    if (!q) throw new Error('q parameter required')

    const response = await fetch(`https://api.deezer.com/search/podcast?q=${encodeURIComponent(q)}&limit=10`)

    if (!response.ok) throw new Error('Failed to search podcasts')

    const data = await response.json()

    const results = (data.data || []).map((podcast: any) => ({
      id: podcast.id,
      title: podcast.title || '',
      description: podcast.description || '',
      link: podcast.link || '',
      picture: podcast.picture_medium || '',
      fans: podcast.fans || 0,
      nbEpisodes: podcast.nb_episodes || 0
    }))

    return { query: q, total: results.length, results }
  }
)
