import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'hacker-news', endpoint: '/api/tools/hacker-news', costCredits: 1 },
  async (req, { searchParams }) => {
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 30)

    const topRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json', {
      signal: AbortSignal.timeout(10000)
    })

    if (!topRes.ok) throw new Error('Failed to fetch Hacker News')

    const topIds: number[] = await topRes.json()
    const stories = await Promise.all(
      topIds.slice(0, limit).map(async (id) => {
        const res = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`, {
          signal: AbortSignal.timeout(5000)
        })
        if (res.ok) return res.json()
        return null
      })
    )

    const items = stories.filter(Boolean).map((s: any) => ({
      title: s.title,
      url: s.url,
      score: s.score,
      author: s.by,
      comments: s.descendants || 0,
      time: new Date(s.time * 1000).toISOString()
    }))

    return { count: items.length, stories: items }
  }
)
