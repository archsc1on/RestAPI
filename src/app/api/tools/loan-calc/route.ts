import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'loan-calc', endpoint: '/api/tools/loan-calc', costCredits: 1 },
  async (req, { searchParams }) => {
    const principal = parseFloat(searchParams.get('principal') || '')
    const rate = parseFloat(searchParams.get('rate') || '')
    const months = parseInt(searchParams.get('months') || '')
    if (isNaN(principal) || isNaN(rate) || isNaN(months)) throw new Error('principal, rate, and months are required')

    const monthlyRate = rate / 100 / 12
    let monthlyPayment: number
    let totalPayment: number

    if (monthlyRate === 0) {
      monthlyPayment = principal / months
      totalPayment = principal
    } else {
      monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / (Math.pow(1 + monthlyRate, months) - 1)
      totalPayment = monthlyPayment * months
    }

    return {
      principal, rate, months,
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalPayment: Math.round(totalPayment * 100) / 100,
      totalInterest: Math.round((totalPayment - principal) * 100) / 100
    }
  }
)
