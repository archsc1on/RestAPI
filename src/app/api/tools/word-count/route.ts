import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'word-count', endpoint: '/api/tools/word-count', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text parameter required')

    const words = text.trim().split(/\s+/).filter(Boolean)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0)
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const readTime = Math.ceil(words.length / 200)

    return {
      text: text.substring(0, 200) + (text.length > 200 ? '...' : ''),
      words: words.length,
      characters: chars,
      charactersNoSpace: charsNoSpace,
      sentences: sentences.length,
      paragraphs: paragraphs.length,
      readingTime: `${readTime} min`,
      speakingTime: `${Math.ceil(words.length / 130)} min`
    }
  }
)
