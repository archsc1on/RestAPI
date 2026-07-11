import { createPlugin } from '@/lib/plugin'

function parseColor(color: string, from: string): [number, number, number] {
  const clean = color.trim().toLowerCase()

  if (from === 'hex' || (!from && clean.startsWith('#'))) {
    const hex = clean.replace('#', '')
    if (hex.length === 3) {
      return [
        parseInt(hex[0] + hex[0], 16),
        parseInt(hex[1] + hex[1], 16),
        parseInt(hex[2] + hex[2], 16)
      ]
    }
    return [
      parseInt(hex.substring(0, 2), 16),
      parseInt(hex.substring(2, 4), 16),
      parseInt(hex.substring(4, 6), 16)
    ]
  }

  if (from === 'rgb' || (!from && clean.startsWith('rgb'))) {
    const match = clean.match(/(\d+)/g)
    if (match && match.length >= 3) {
      return [parseInt(match[0]), parseInt(match[1]), parseInt(match[2])]
    }
  }

  if (from === 'hsl' || (!from && clean.startsWith('hsl'))) {
    const match = clean.match(/(\d+)/g)
    if (match && match.length >= 3) {
      return hslToRgb(parseInt(match[0]), parseInt(match[1]), parseInt(match[2]))
    }
  }

  throw new Error('Could not parse color')
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  s /= 100; l /= 100
  const a = s * Math.min(l, 1 - l)
  const f = (n: number) => {
    const k = (n + h / 30) % 12
    return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))
  }
  return [Math.round(f(0) * 255), Math.round(f(8) * 255), Math.round(f(4) * 255)]
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
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

  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)]
}

export const GET = createPlugin(
  { name: 'color-convert', endpoint: '/api/tools/color-convert', costCredits: 1 },
  async (req, { searchParams }) => {
    const color = searchParams.get('color')
    const fromFormat = searchParams.get('fromFormat') || ''
    const toFormat = searchParams.get('toFormat') || 'hex'

    if (!color) throw new Error('color parameter required')

    const [r, g, b] = parseColor(color, fromFormat)

    const hex = `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`
    const rgb = `rgb(${r}, ${g}, ${b})`
    const [h, s, l] = rgbToHsl(r, g, b)
    const hsl = `hsl(${h}, ${s}%, ${l}%)`

    const formats: Record<string, string> = { hex, rgb, hsl }

    return {
      input: color,
      result: formats[toFormat] || hex,
      all: { hex, rgb, hsl }
    }
  }
)
