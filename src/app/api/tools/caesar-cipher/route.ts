import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'caesar-cipher', endpoint: '/api/tools/caesar-cipher', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    const shift = parseInt(searchParams.get('shift') || '0')
    const mode = searchParams.get('mode') || 'encode'
    if (!text) throw new Error('text is required')

    const s = mode === 'decode' ? (26 - shift) % 26 : shift
    const result = text.replace(/[a-zA-Z]/g, (c) => {
      const base = c === c.toUpperCase() ? 65 : 97
      return String.fromCharCode(((c.charCodeAt(0) - base + s) % 26) + base)
    })

    return { text, shift, mode, result }
  }
)
