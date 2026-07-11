import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'pig-latin', endpoint: '/api/tools/pig-latin', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    const toPigLatin = (word: string): string => {
      const vowels = /^[aeiou]/i
      if (vowels.test(word)) return word + 'way'
      const match = word.match(/^([^aeiou]+)(.*)/i)
      if (match) return match[2] + match[1].toLowerCase() + 'ay'
      return word + 'ay'
    }

    const result = text.split(/\s+/).map(toPigLatin).join(' ')
    return { original: text, pigLatin: result }
  }
)
