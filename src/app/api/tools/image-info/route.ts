import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'image-info', endpoint: '/api/tools/image-info', costCredits: 1 },
  async (req, { searchParams }) => {
    const width = parseInt(searchParams.get('width') || '300')
    const height = parseInt(searchParams.get('height') || '200')
    const text = searchParams.get('text') || `${width}x${height}`

    const url = `https://placehold.co/${width}xheight/94a3b8/ffffff?text=${encodeURIComponent(text)}`

    return { width, height, text, url: `https://placehold.co/${width}x${height}/94a3b8/ffffff?text=${encodeURIComponent(text)}` }
  }
)
