import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'timezone', endpoint: '/api/tools/timezone', costCredits: 1 },
  async (req, { searchParams }) => {
    const tz = searchParams.get('tz') || searchParams.get('timezone') || 'Asia/Jakarta'

    try {
      const response = await fetch(`https://worldtimeapi.org/api/timezone/${encodeURIComponent(tz)}`)
      if (response.ok) {
        const data = await response.json()
        return {
          timezone: data.timezone,
          abbreviation: data.abbreviation,
          datetime: data.datetime,
          date: data.datetime?.split('T')[0] || '',
          time: data.datetime?.split('T')[1]?.split('.')[0] || '',
          utcOffset: data.utc_offset,
          dayOfWeek: data.day_of_week,
          dst: data.dst
        }
      }
    } catch {}

    const now = new Date()
    const options: Intl.DateTimeFormatOptions = {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      hour12: false
    }
    const formatter = new Intl.DateTimeFormat('en-US', options)
    const parts = formatter.formatToParts(now)
    const get = (type: string) => parts.find(p => p.type === type)?.value || ''

    return {
      timezone: tz,
      datetime: now.toLocaleString('en-US', { timeZone: tz }),
      date: `${get('year')}-${get('month')}-${get('day')}`,
      time: `${get('hour')}:${get('minute')}:${get('second')}`,
      dayOfWeek: now.toLocaleDateString('en-US', { timeZone: tz, weekday: 'long' })
    }
  }
)
