import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'age-calc', endpoint: '/api/tools/age-calc', costCredits: 1 },
  async (req, { searchParams }) => {
    const birthday = searchParams.get('birthday')
    if (!birthday) throw new Error('birthday is required')

    const birth = new Date(birthday)
    const now = new Date()
    if (isNaN(birth.getTime())) throw new Error('Invalid date format. Use YYYY-MM-DD')

    let years = now.getFullYear() - birth.getFullYear()
    let months = now.getMonth() - birth.getMonth()
    let days = now.getDate() - birth.getDate()

    if (days < 0) { months--; days += new Date(now.getFullYear(), now.getMonth(), 0).getDate() }
    if (months < 0) { years--; months += 12 }

    const totalDays = Math.floor((now.getTime() - birth.getTime()) / (1000 * 60 * 60 * 24))

    return { birthday, years, months, days, totalDays }
  }
)
