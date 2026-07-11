import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'compound-interest', endpoint: '/api/tools/compound-interest', costCredits: 1 },
  async (req, { searchParams }) => {
    const principal = parseFloat(searchParams.get('principal') || '')
    const rate = parseFloat(searchParams.get('rate') || '')
    const years = parseFloat(searchParams.get('years') || '')
    const compounds = parseInt(searchParams.get('compounds') || '12')
    if (isNaN(principal) || isNaN(rate) || isNaN(years)) throw new Error('principal, rate, and years are required')

    const r = rate / 100
    const amount = principal * Math.pow(1 + r / compounds, compounds * years)
    const interest = amount - principal

    return {
      principal, rate, years, compounds,
      finalAmount: Math.round(amount * 100) / 100,
      totalInterest: Math.round(interest * 100) / 100
    }
  }
)
