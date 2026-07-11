import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'tip-calc', endpoint: '/api/tools/tip-calc', costCredits: 1 },
  async (req, { searchParams }) => {
    const total = parseFloat(searchParams.get('total') || '')
    const tipPercent = parseFloat(searchParams.get('tipPercent') || '15')
    if (isNaN(total)) throw new Error('total is required')

    const tip = total * tipPercent / 100
    const final = total + tip

    return { total, tipPercent, tip: Math.round(tip * 100) / 100, final: Math.round(final * 100) / 100 }
  }
)
