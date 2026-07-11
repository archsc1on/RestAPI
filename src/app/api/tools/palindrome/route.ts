import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'palindrome', endpoint: '/api/tools/palindrome', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    const cleaned = text.toLowerCase().replace(/[^a-z0-9]/g, '')
    const isPalindrome = cleaned === cleaned.split('').reverse().join('')

    return { text, isPalindrome, cleaned }
  }
)
