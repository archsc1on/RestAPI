import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'tz-convert', endpoint: '/api/tools/tz-convert', costCredits: 1 },
  async (req, { searchParams }) => {
    const time = searchParams.get('time')
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    if (!time || !from || !to) throw new Error('time, from, and to are required')

    let date: Date
    if (/^\d{2}:\d{2}$/.test(time)) {
      const today = new Date().toISOString().split('T')[0]
      date = new Date(`${today}T${time}:00`)
    } else {
      date = new Date(time)
    }
    if (isNaN(date.getTime())) throw new Error('Invalid time format')

    const fromTime = date.toLocaleString('en-US', { timeZone: from })
    const toTime = date.toLocaleString('en-US', { timeZone: to })
    const fromOffset = -(date.toLocaleString('en-US', { timeZone: from, timeZoneName: 'shortOffset' }).match(/GMT([+-]\d+)?/)?.[0] || 'GMT+0').replace('GMT', '') || '0'
    const toOffset = -(date.toLocaleString('en-US', { timeZone: to, timeZoneName: 'shortOffset' }).match(/GMT([+-]\d+)?/)?.[0] || 'GMT+0').replace('GMT', '') || '0'

    return { time, from, to, fromTime, toTime }
  }
)
