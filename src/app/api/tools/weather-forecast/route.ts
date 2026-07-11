import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'weather-forecast', endpoint: '/api/tools/weather-forecast', costCredits: 1 },
  async (req, { searchParams }) => {
    const city = searchParams.get('city')

    if (!city) throw new Error('city parameter required')

    const response = await fetch(
      `https://wttr.in/${encodeURIComponent(city)}?format=j1`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('City not found')

    const data = await response.json()
    const forecasts = (data.weather || []).map((day: any) => ({
      date: day.date,
      maxTemp: day.maxtempC,
      minTemp: day.mintempC,
      avgTemp: day.avgtempC,
      description: day.hourly?.[4]?.weatherDesc?.[0]?.value || '',
      chanceOfRain: day.hourly?.[4]?.chanceofrain || '0',
      uvIndex: day.uvIndex
    }))

    return {
      city: data.nearest_area?.[0]?.areaName?.[0]?.value || city,
      country: data.nearest_area?.[0]?.country?.[0]?.value || '',
      forecasts
    }
  }
)
