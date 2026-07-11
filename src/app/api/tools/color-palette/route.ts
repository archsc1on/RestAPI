import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'color-palette', endpoint: '/api/tools/color-palette', costCredits: 1 },
  async (req, { searchParams }) => {
    const hex = searchParams.get('hex')
    if (!hex) throw new Error('hex is required')

    const clean = hex.replace('#', '')
    if (!/^[0-9a-fA-F]{3,6}$/.test(clean)) throw new Error('Invalid hex color')

    let r: number, g: number, b: number
    if (clean.length === 3) {
      r = parseInt(clean[0] + clean[0], 16)
      g = parseInt(clean[1] + clean[1], 16)
      b = parseInt(clean[2] + clean[2], 16)
    } else {
      r = parseInt(clean.substring(0, 2), 16)
      g = parseInt(clean.substring(2, 4), 16)
      b = parseInt(clean.substring(4, 6), 16)
    }

    const palette = [0.2, 0.4, 0.6, 0.8, 1.0].map(factor => {
      const nr = Math.round(r * factor + (1 - factor) * 255)
      const ng = Math.round(g * factor + (1 - factor) * 255)
      const nb = Math.round(b * factor + (1 - factor) * 255)
      return `#${[nr, ng, nb].map(c => Math.min(255, Math.max(0, c)).toString(16).padStart(2, '0')).join('')}`
    })

    return { hex: `#${clean}`, palette }
  }
)
