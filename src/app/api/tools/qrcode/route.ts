// src/app/api/tools/qrcode/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'qrcode', endpoint: '/api/tools/qrcode', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    const size = searchParams.get('size') || '300'

    if (!text) throw new Error('text parameter required')

    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}`

    return {
      text,
      size: `${size}x${size}`,
      qr: qrUrl,
      format: 'png'
    }
  }
)
