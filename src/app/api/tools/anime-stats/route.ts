import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anime-stats', endpoint: '/api/tools/anime-stats', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required')

    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/statistics`)

    if (!response.ok) throw new Error('Failed to fetch anime statistics')

    const data = await response.json()
    const stats = data.data

    return {
      id: parseInt(id),
      watching: stats.watching || 0,
      completed: stats.completed || 0,
      onHold: stats.on_hold || 0,
      dropped: stats.dropped || 0,
      planToWatch: stats.plan_to_watch || 0,
      total: stats.total || 0,
      scores: stats.scores || {}
    }
  }
)
