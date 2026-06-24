import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'base64', endpoint: '/api/tools/base64', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    const mode = searchParams.get('mode') || 'encode'

    if (!text) throw new Error('text parameter required')

    if (mode === 'encode') {
      return { mode: 'encode', input: text, output: Buffer.from(text).toString('base64') }
    }

    if (mode === 'decode') {
      try {
        return { mode: 'decode', input: text, output: Buffer.from(text, 'base64').toString('utf-8') }
      } catch {
        throw new Error('Invalid base64 string')
      }
    }

    throw new Error('mode must be "encode" or "decode"')
  }
)
