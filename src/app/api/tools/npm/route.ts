import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'npm', endpoint: '/api/tools/npm', costCredits: 1 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    if (!query) throw new Error('q (query) parameter required')

    const response = await fetch(`https://registry.npmjs.org/-/v1/search?text=${encodeURIComponent(query)}&size=5`)
    if (!response.ok) throw new Error('Failed to search npm packages')

    const data = await response.json()
    const results = (data.objects || []).map((obj: any) => {
      const pkg = obj.package || {}
      return {
        name: pkg.name || '',
        version: pkg.version || '',
        description: pkg.description || '',
        author: pkg.author?.name || pkg.publisher?.username || '',
        keywords: (pkg.keywords || []).slice(0, 5),
        date: pkg.date || '',
        npmUrl: `https://www.npmjs.com/package/${pkg.name}`,
        repository: pkg.links?.repository || '',
        weeklyDownloads: obj.score?.detail?.popularity ? Math.round(obj.score.detail.popularity * 100000) : 0
      }
    })

    return { query, total: results.length, results }
  }
)
