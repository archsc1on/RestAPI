import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'placeholder', endpoint: '/api/tools/placeholder', costCredits: 1 },
  async (req, { searchParams }) => {
    const width = parseInt(searchParams.get('width') || '300')
    const height = parseInt(searchParams.get('height') || '200')
    const text = searchParams.get('text') || `${width}x${height}`
    const bgColor = searchParams.get('bg') || '94a3b8'
    const textColor = searchParams.get('color') || 'ffffff'

    const url = `https://placehold.co/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`

    return {
      width,
      height,
      text,
      url,
      format: 'png'
    }
  }
)
