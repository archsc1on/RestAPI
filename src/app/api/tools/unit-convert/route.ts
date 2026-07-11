import { createPlugin } from '@/lib/plugin'

const conversions: Record<string, { factor?: number; fn?: (v: number) => number }> = {
  'kg-lb': { factor: 2.20462 },
  'lb-kg': { factor: 0.453592 },
  'km-miles': { factor: 0.621371 },
  'miles-km': { factor: 1.60934 },
  'cm-inches': { factor: 0.393701 },
  'inches-cm': { factor: 2.54 },
  'm-feet': { factor: 3.28084 },
  'feet-m': { factor: 0.3048 },
  'c-f': { fn: (v: number) => v * 9 / 5 + 32 },
  'f-c': { fn: (v: number) => (v - 32) * 5 / 9 },
  'c-k': { fn: (v: number) => v + 273.15 },
  'k-c': { fn: (v: number) => v - 273.15 },
  'l-gal': { factor: 0.264172 },
  'gal-l': { factor: 3.78541 },
  'oz-g': { factor: 28.3495 },
  'g-oz': { factor: 0.035274 },
  'mb-gb': { factor: 0.001 },
  'gb-mb': { factor: 1000 }
}

export const GET = createPlugin(
  { name: 'unit-convert', endpoint: '/api/tools/unit-convert', costCredits: 1 },
  async (req, { searchParams }) => {
    const value = parseFloat(searchParams.get('value') || '')
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (isNaN(value)) throw new Error('value parameter required (number)')
    if (!from) throw new Error('from parameter required')
    if (!to) throw new Error('to parameter required')

    const key = `${from.toLowerCase()}-${to.toLowerCase()}`
    const conv = conversions[key]

    if (!conv) {
      throw new Error(`Unsupported conversion: ${key}. Supported: ${Object.keys(conversions).join(', ')}`)
    }

    const result = conv.fn ? conv.fn(value) : value * (conv.factor || 1)

    return {
      input: value,
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      result: Math.round(result * 1000000) / 1000000
    }
  }
)
