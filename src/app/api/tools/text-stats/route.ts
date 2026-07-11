import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'text-stats', endpoint: '/api/tools/text-stats', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    const words = text.trim().split(/\s+/).filter(Boolean).length
    const chars = text.length
    const charsNoSpace = text.replace(/\s/g, '').length
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0).length
    const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 0).length
    const readingTimeMin = Math.ceil(words / 200)

    return { text, words, chars, charsNoSpace, sentences, paragraphs, readingTimeMin }
  }
)
