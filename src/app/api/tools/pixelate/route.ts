import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'pixelate', endpoint: '/api/tools/pixelate', costCredits: 1 },
  async (req, { searchParams }) => {
    const width = parseInt(searchParams.get('width') || '300')
    const height = parseInt(searchParams.get('height') || '200')

    const url = `https://placehold.co/${width}x${height}/6b7280/ffffff?text=Pixelated`

    return { width, height, url }
  }
)
