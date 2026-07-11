import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'npm-trending', endpoint: '/api/tools/npm-trending', costCredits: 1 },
  async (req, { searchParams }) => {
    const response = await fetch('https://api.npmjs.org/downloads/point/last-week', {
      signal: AbortSignal.timeout(10000)
    })

    if (!response.ok) {
      return {
        message: 'NPM trending data available via downloads API',
        note: 'Use /api/tools/npm for specific package searches'
      }
    }

    return {
      message: 'Use /api/tools/npm?query=<package> to search for specific npm packages'
    }
  }
)
