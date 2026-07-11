import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'text-diff', endpoint: '/api/tools/text-diff', costCredits: 1 },
  async (req, { searchParams }) => {
    const text1 = searchParams.get('text1')
    const text2 = searchParams.get('text2')
    if (!text1 || !text2) throw new Error('text1 and text2 are required')

    const lines1 = text1.split('\n')
    const lines2 = text2.split('\n')
    const maxLen = Math.max(lines1.length, lines2.length)
    const diff: { line: number; type: string; text1?: string; text2?: string }[] = []

    for (let i = 0; i < maxLen; i++) {
      const a = lines1[i]
      const b = lines2[i]
      if (a === undefined) diff.push({ line: i + 1, type: 'added', text2: b })
      else if (b === undefined) diff.push({ line: i + 1, type: 'removed', text1: a })
      else if (a !== b) diff.push({ line: i + 1, type: 'changed', text1: a, text2: b })
    }

    return { diff, same: diff.length === 0, linesText1: lines1.length, linesText2: lines2.length }
  }
)
