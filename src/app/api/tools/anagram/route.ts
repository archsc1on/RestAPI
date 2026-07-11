import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anagram', endpoint: '/api/tools/anagram', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    const text2 = searchParams.get('text2')
    if (!text || !text2) throw new Error('text and text2 are required')

    const sort = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '').split('').sort().join('')
    const isAnagram = sort(text) === sort(text2)

    return { text, text2, isAnagram }
  }
)
