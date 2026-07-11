import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'rot13', endpoint: '/api/tools/rot13', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    const result = text.replace(/[a-zA-Z]/g, (c) => {
      const base = c === c.toUpperCase() ? 65 : 97
      return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base)
    })

    return { text, result }
  }
)
