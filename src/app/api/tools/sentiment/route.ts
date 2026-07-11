import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'sentiment', endpoint: '/api/tools/sentiment', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    const positive = ['good', 'great', 'happy', 'love', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome', 'nice', 'beautiful', 'best', 'joy', 'like', 'perfect', 'brilliant', 'superb', 'pleasant', 'delightful', 'cheerful', 'pleased', 'grateful', 'excited', 'thrilled', 'magnificent']
    const negative = ['bad', 'terrible', 'hate', 'ugly', 'awful', 'horrible', 'worst', 'sad', 'angry', 'annoying', 'disgusting', 'boring', 'poor', 'disappointing', 'painful', 'miserable', 'dreadful', 'lousy', 'nasty', 'furious', 'upset', 'mad', 'sick', 'wrong', 'fail']

    const words = text.toLowerCase().match(/\b\w+\b/g) || []
    let pos = 0, neg = 0
    for (const w of words) {
      if (positive.includes(w)) pos++
      if (negative.includes(w)) neg++
    }

    const total = pos + neg
    const score = total === 0 ? 0 : (pos - neg) / total
    const label = score > 0.1 ? 'positive' : score < -0.1 ? 'negative' : 'neutral'

    return { text, positive: pos, negative: neg, score: Math.round(score * 100) / 100, label }
  }
)
