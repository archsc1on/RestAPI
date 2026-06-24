import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'pollution', endpoint: '/api/tools/pollution', costCredits: 1 },
  async (req, { searchParams }) => {
    const lat = searchParams.get('lat')
    const lon = searchParams.get('lon')

    if (!lat || !lon) throw new Error('lat and lon parameters required')

    const response = await fetch(
      `https://api.waqi.info/feed/geo:${lat};${lon}/?token=demo`
    )
    if (!response.ok) throw new Error('Failed to fetch air quality data')

    const data = await response.json()
    if (data.status !== 'ok') throw new Error('API returned error')

    const d = data.data
    return {
      city: d.city?.name || '',
      aqi: d.aqi || 0,
      level: getAqiLevel(d.aqi || 0),
      dominantPollutant: d.dominentpol || '',
      iaqi: d.iaqi || {},
      time: d.time?.s || '',
      url: d.url || ''
    }
  }
)

function getAqiLevel(aqi: number): string {
  if (aqi <= 50) return 'Good'
  if (aqi <= 100) return 'Moderate'
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups'
  if (aqi <= 200) return 'Unhealthy'
  if (aqi <= 300) return 'Very Unhealthy'
  return 'Hazardous'
}
