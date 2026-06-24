import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'color', endpoint: '/api/tools/color', costCredits: 1 },
  async (req, { searchParams }) => {
    const hex = searchParams.get('hex') || searchParams.get('color') || '#3b82f6'
    const cleanHex = hex.replace('#', '')

    if (!/^[0-9a-fA-F]{3,8}$/.test(cleanHex)) {
      throw new Error('Invalid hex color')
    }

    let r: number, g: number, b: number
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16)
      g = parseInt(cleanHex[1] + cleanHex[1], 16)
      b = parseInt(cleanHex[2] + cleanHex[2], 16)
    } else {
      r = parseInt(cleanHex.substring(0, 2), 16)
      g = parseInt(cleanHex.substring(2, 4), 16)
      b = parseInt(cleanHex.substring(4, 6), 16)
    }

    const hsl = rgbToHsl(r, g, b)

    return {
      hex: `#${cleanHex.substring(0, 6)}`,
      rgb: { r, g, b },
      hsl,
      preview: `https://placehold.co/100x100/${cleanHex.substring(0, 6)}/${cleanHex.substring(0, 6)}.png`,
      shades: generateShades(r, g, b),
      tones: generateTones(r, g, b)
    }
  }
)

function rgbToHsl(r: number, g: number, b: number) {
  r /= 255; g /= 255; b /= 255
  const max = Math.max(r, g, b), min = Math.min(r, g, b)
  let h = 0, s = 0
  const l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break
      case g: h = ((b - r) / d + 2) / 6; break
      case b: h = ((r - g) / d + 4) / 6; break
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    l: Math.round(l * 100)
  }
}

function generateShades(r: number, g: number, b: number): string[] {
  return Array.from({ length: 9 }, (_, i) => {
    const factor = 1 - (i + 1) / 10
    return `#${[r, g, b].map(c => Math.round(c * factor).toString(16).padStart(2, '0')).join('')}`
  })
}

function generateTones(r: number, g: number, b: number): string[] {
  return Array.from({ length: 9 }, (_, i) => {
    const factor = (i + 1) / 10
    const nr = Math.round(r + (128 - r) * factor)
    const ng = Math.round(g + (128 - g) * factor)
    const nb = Math.round(b + (128 - b) * factor)
    return `#${[nr, ng, nb].map(c => Math.min(255, c).toString(16).padStart(2, '0')).join('')}`
  })
}
