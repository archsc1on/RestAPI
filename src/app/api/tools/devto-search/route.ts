import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'devto-search', endpoint: '/api/tools/devto-search', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')

    if (!q) throw new Error('q parameter required')

    const response = await fetch(
      `https://dev.to/api/articles?tag=${encodeURIComponent(q)}&per_page=10`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('Failed to search dev.to')

    const data = await response.json()
    const articles = data.map((a: any) => ({
      title: a.title,
      description: a.description,
      url: a.url,
      author: a.user?.name,
      tags: a.tag_list,
      reactions: a.positive_reactions_count,
      comments: a.comments_count,
      publishedAt: a.published_at
    }))

    return { query: q, count: articles.length, articles }
  }
)
