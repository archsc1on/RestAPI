import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'docker-hub', endpoint: '/api/tools/docker-hub', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')

    if (!q) throw new Error('q parameter required')

    const response = await fetch(
      `https://hub.docker.com/v2/search/repositories/?query=${encodeURIComponent(q)}&page_size=10`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('Failed to search Docker Hub')

    const data = await response.json()
    const repos = (data.results || []).map((r: any) => ({
      name: r.repo_name,
      description: r.short_description,
      stars: r.star_count,
      pulls: r.pull_count,
      official: r.is_official,
      updated: r.last_updated
    }))

    return { query: q, count: repos.length, repos }
  }
)
