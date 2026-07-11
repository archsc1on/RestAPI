import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'url-validate', endpoint: '/api/tools/url-validate', costCredits: 1 },
  async (req, { searchParams }) => {
    const url = searchParams.get('url')
    if (!url) throw new Error('url is required')

    let isValid = false
    try {
      new URL(url)
      isValid = true
    } catch {
      isValid = false
    }

    return { url, isValid }
  }
)
