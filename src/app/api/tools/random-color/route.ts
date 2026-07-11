import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'random-color', endpoint: '/api/tools/random-color', costCredits: 1 },
  async (req, { searchParams }) => {
    const format = searchParams.get('format') || 'hex'

    const r = Math.floor(Math.random() * 256)
    const g = Math.floor(Math.random() * 256)
    const b = Math.floor(Math.random() * 256)

    const hex = `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`
    const rgb = `rgb(${r}, ${g}, ${b})`

    let h = 0, s = 0, l = 0
    const rNorm = r / 255, gNorm = g / 255, bNorm = b / 255
    const max = Math.max(rNorm, gNorm, bNorm), min = Math.min(rNorm, gNorm, bNorm)
    l = (max + min) / 2
    if (max !== min) {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
      switch (max) {
        case rNorm: h = ((gNorm - bNorm) / d + (gNorm < bNorm ? 6 : 0)) / 6; break
        case gNorm: h = ((bNorm - rNorm) / d + 2) / 6; break
        case bNorm: h = ((rNorm - gNorm) / d + 4) / 6; break
      }
    }
    const hsl = `hsl(${Math.round(h * 360)}, ${Math.round(s * 100)}%, ${Math.round(l * 100)}%)`

    const formats: Record<string, string> = { hex, rgb, hsl }

    return { color: formats[format] || hex, all: { hex, rgb, hsl } }
  }
)
