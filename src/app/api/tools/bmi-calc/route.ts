import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'bmi-calc', endpoint: '/api/tools/bmi-calc', costCredits: 1 },
  async (req, { searchParams }) => {
    const weight = parseFloat(searchParams.get('weight') || '')
    const height = parseFloat(searchParams.get('height') || '')
    if (isNaN(weight) || isNaN(height)) throw new Error('weight (kg) and height (cm) are required')

    const heightM = height / 100
    const bmi = weight / (heightM * heightM)
    let category: string
    if (bmi < 18.5) category = 'Underweight'
    else if (bmi < 25) category = 'Normal weight'
    else if (bmi < 30) category = 'Overweight'
    else category = 'Obese'

    return { weight, height, bmi: Math.round(bmi * 10) / 10, category }
  }
)
