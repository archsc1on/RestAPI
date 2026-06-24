import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'reverse-text', endpoint: '/api/tools/reverse-text', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text parameter required')

    return {
      input: text,
      reversed: text.split('').reverse().join(''),
      reversedWords: text.split(' ').reverse().join(' ')
    }
  }
)
