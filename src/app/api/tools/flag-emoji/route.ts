import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'flag-emoji', endpoint: '/api/tools/flag-emoji', costCredits: 1 },
  async (req, { searchParams }) => {
    const code = searchParams.get('code')
    if (!code) throw new Error('code is required')

    const cc = code.toUpperCase()
    if (cc.length !== 2 || !/^[A-Z]{2}$/.test(cc)) throw new Error('code must be a 2-letter country code')

    const emoji = cc.replace(/./g, (c) => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65))

    return { code: cc, emoji }
  }
)
