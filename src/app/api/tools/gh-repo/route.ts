import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'gh-repo', endpoint: '/api/tools/gh-repo', costCredits: 1 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10)

    if (!query) throw new Error('q (query) parameter required')

    const response = await fetch(
      `https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&sort=stars&order=desc&per_page=${limit}`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    )
    if (!response.ok) throw new Error('Search failed')

    const data = await response.json()
    const results = (data.items || []).map((repo: any) => ({
      name: repo.full_name,
      description: repo.description || '',
      stars: repo.stargazers_count || 0,
      forks: repo.forks_count || 0,
      language: repo.language || '',
      url: repo.html_url,
      license: repo.license?.spdx_id || '',
      topics: (repo.topics || []).slice(0, 5),
      createdAt: repo.created_at,
      updatedAt: repo.updated_at
    }))

    return { query, total: results.length, results }
  }
)
