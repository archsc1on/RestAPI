import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'meme', endpoint: '/api/tools/meme', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 5)

    try {
      const response = await fetch('https://meme-api.com/gimme/' + count)
      if (response.ok) {
        const data = await response.json()
        const memes = (Array.isArray(data) ? data : [data]).map((m: any) => ({
          title: m.title || '',
          author: m.author || '',
          subreddit: m.subreddit || '',
          url: m.url || '',
          postLink: m.postLink || '',
          ups: m.ups || 0
        }))

        return { count: memes.length, memes }
      }
    } catch {}

    throw new Error('Failed to fetch memes')
  }
)
