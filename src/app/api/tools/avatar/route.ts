import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'avatar', endpoint: '/api/tools/avatar', costCredits: 1 },
  async (req, { searchParams }) => {
    const name = searchParams.get('name') || 'User'
    const size = searchParams.get('size') || '128'
    const background = searchParams.get('bg') || 'random'
    const color = searchParams.get('color') || 'ffffff'
    const bold = searchParams.get('bold') !== 'false'
    const format = searchParams.get('format') || 'svg'

    const params = new URLSearchParams({
      name,
      size,
      background,
      color,
      bold: bold.toString(),
      format
    })

    const url = `https://ui-avatars.com/api/?${params.toString()}`

    return {
      name,
      size: parseInt(size),
      url,
      format
    }
  }
)
