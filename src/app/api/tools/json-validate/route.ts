import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'json-validate', endpoint: '/api/tools/json-validate', costCredits: 1 },
  async (req, { searchParams }) => {
    const json = searchParams.get('json')

    if (!json) throw new Error('json parameter required')

    try {
      const parsed = JSON.parse(json)
      return {
        valid: true,
        type: Array.isArray(parsed) ? 'array' : typeof parsed,
        keys: typeof parsed === 'object' && parsed !== null ? Object.keys(parsed).length : undefined
      }
    } catch (e: any) {
      return {
        valid: false,
        error: e.message
      }
    }
  }
)
