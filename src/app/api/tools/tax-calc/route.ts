import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'tax-calc', endpoint: '/api/tools/tax-calc', costCredits: 1 },
  async (req, { searchParams }) => {
    const amount = parseFloat(searchParams.get('amount') || '')
    const taxRate = parseFloat(searchParams.get('taxRate') || '')
    if (isNaN(amount) || isNaN(taxRate)) throw new Error('amount and taxRate are required')

    const tax = amount * taxRate / 100
    const total = amount + tax

    return { amount, taxRate, tax: Math.round(tax * 100) / 100, total: Math.round(total * 100) / 100 }
  }
)
