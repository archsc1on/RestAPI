import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'qr-decode', endpoint: '/api/tools/qr-decode', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    const size = parseInt(searchParams.get('size') || '300')
    const url = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`

    return { text, size, url }
  }
)
