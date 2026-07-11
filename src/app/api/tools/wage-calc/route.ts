import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'wage-calc', endpoint: '/api/tools/wage-calc', costCredits: 1 },
  async (req, { searchParams }) => {
    const hourly = parseFloat(searchParams.get('hourly') || '')
    const hoursPerWeek = parseFloat(searchParams.get('hoursPerWeek') || '40')
    if (isNaN(hourly)) throw new Error('hourly wage is required')

    const weekly = hourly * hoursPerWeek
    const monthly = weekly * 4.33
    const yearly = weekly * 52

    return { hourly, hoursPerWeek, weekly: Math.round(weekly * 100) / 100, monthly: Math.round(monthly * 100) / 100, yearly: Math.round(yearly * 100) / 100 }
  }
)
