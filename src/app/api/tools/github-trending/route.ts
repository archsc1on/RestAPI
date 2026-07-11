import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'github-trending', endpoint: '/api/tools/github-trending', costCredits: 1 },
  async (req, { searchParams }) => {
    const language = searchParams.get('language')
    const since = searchParams.get('since') || 'daily'

    const apiUrl = process.env.GITHUB_TRENDING_API_URL || 'https://api.gitterapp.com/repositories'
    let url = `${apiUrl}?since=${since}`
    if (language) url += `&language=${encodeURIComponent(language)}`

    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })

    if (!response.ok) {
      return {
        message: 'GitHub trending API unavailable',
        language, since,
        hint: 'Try again later or use the GitHub API directly'
      }
    }

    const data = await response.json()
    const repos = (data || []).slice(0, 25).map((repo: any) => ({
      name: repo.author ? `${repo.author}/${repo.name}` : repo.name,
      description: repo.description,
      language: repo.language,
      stars: repo.stars,
      forks: repo.forks,
      starsToday: repo.currentPeriodStars,
      url: repo.url
    }))

    return { since, language: language || 'all', count: repos.length, repos }
  }
)
