import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'sharpen-img', endpoint: '/api/tools/sharpen-img', costCredits: 1 },
  async (req, { searchParams }) => {
    const width = parseInt(searchParams.get('width') || '300')
    const height = parseInt(searchParams.get('height') || '200')

    const url = `https://placehold.co/${width}x${height}/374151/f9fafb?text=Sharpened`

    return { width, height, url }
  }
)
