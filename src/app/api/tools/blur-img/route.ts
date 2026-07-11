import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'blur-img', endpoint: '/api/tools/blur-img', costCredits: 1 },
  async (req, { searchParams }) => {
    const width = parseInt(searchParams.get('width') || '300')
    const height = parseInt(searchParams.get('height') || '200')

    const url = `https://placehold.co/${width}x${height}/e2e8f0/94a3b8?text=Blurred`

    return { width, height, url }
  }
)
