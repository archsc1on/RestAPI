import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'word-frequency', endpoint: '/api/tools/word-frequency', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    const freq: Record<string, number> = {}
    const words = text.toLowerCase().match(/\b[a-z0-9']+\b/g) || []
    for (const w of words) {
      freq[w] = (freq[w] || 0) + 1
    }

    const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1])
    return { totalWords: words.length, uniqueWords: sorted.length, frequency: Object.fromEntries(sorted) }
  }
)
