import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'reddit-search', endpoint: '/api/tools/reddit-search', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')
    const subreddit = searchParams.get('subreddit')

    if (!q) throw new Error('q parameter required')

    const url = subreddit
      ? `https://www.reddit.com/r/${encodeURIComponent(subreddit)}/search.json?q=${encodeURIComponent(q)}&limit=10&restrict_sr=on`
      : `https://www.reddit.com/search.json?q=${encodeURIComponent(q)}&limit=10`

    let response
    try {
      response = await fetch(url, {
        headers: {
          'User-Agent': 'RESTAPI-XENDIT/2.0 (by /u/api_bot)',
          'Accept': 'text/html,application/json'
        },
        redirect: 'follow',
        signal: AbortSignal.timeout(10000)
      })
    } catch {
      throw new Error('Reddit blocked the request. Try using https://www.reddit.com/search/?q=' + encodeURIComponent(q))
    }

    if (!response.ok) {
      throw new Error(`Reddit returned ${response.status}. Use https://www.reddit.com/search/?q=${encodeURIComponent(q)} directly`)
    }

    const contentType = response.headers.get('content-type') || ''
    const text = await response.text()

    if (contentType.includes('html')) {
      throw new Error(`Reddit returned HTML instead of JSON. Use https://www.reddit.com/search/?q=${encodeURIComponent(q)} directly`)
    }

    const data = JSON.parse(text)
    const posts = (data.data?.children || []).map((child: any) => ({
      title: child.data.title,
      author: child.data.author,
      subreddit: child.data.subreddit,
      score: child.data.score,
      comments: child.data.num_comments,
      url: `https://reddit.com${child.data.permalink}`,
      created: new Date(child.data.created_utc * 1000).toISOString()
    }))

    return { query: q, count: posts.length, posts }
  }
)
