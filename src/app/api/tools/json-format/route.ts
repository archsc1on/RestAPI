import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'json-format', endpoint: '/api/tools/json-format', costCredits: 1 },
  async (req, { searchParams }) => {
    const json = searchParams.get('json')

    if (!json) throw new Error('json parameter required')

    try {
      const parsed = JSON.parse(json)
      const formatted = JSON.stringify(parsed, null, 2)
      const minified = JSON.stringify(parsed)

      return {
        formatted,
        minified,
        keys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : 0,
        valid: true
      }
    } catch (e: any) {
      throw new Error(`Invalid JSON: ${e.message}`)
    }
  }
)
