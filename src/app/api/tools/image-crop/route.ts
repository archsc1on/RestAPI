import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'image-crop', endpoint: '/api/tools/image-crop', costCredits: 1 },
  async (req, { searchParams }) => {
    const width = parseInt(searchParams.get('width') || '300')
    const height = parseInt(searchParams.get('height') || '200')

    const url = `https://placehold.co/${width}x${height}/1e293b/e2e8f0?text=Cropped`

    return { width, height, url }
  }
)
