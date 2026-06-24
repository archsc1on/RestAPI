import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'inspire', endpoint: '/api/tools/inspire', costCredits: 1 },
  async (req, { searchParams }) => {
    try {
      const response = await fetch('https://api.quotable.io/random')
      if (response.ok) {
        const data = await response.json()
        return {
          content: data.content || '',
          author: data.author || '',
          tags: data.tags || []
        }
      }
    } catch {}

    return {
      content: 'The best time to plant a tree was 20 years ago. The second best time is now.',
      author: 'Chinese Proverb',
      tags: ['motivation', 'life']
    }
  }
)
