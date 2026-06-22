// src/app/api/tools/weather/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'weather', endpoint: '/api/tools/weather', costCredits: 1 },
  async (req, { searchParams }) => {
    const city = searchParams.get('city')

    if (!city) throw new Error('city parameter required')

    // Use wttr.in (free, no key)
    const response = await fetch(`https://wttr.in/${encodeURIComponent(city)}?format=j1`)

    if (!response.ok) {
      throw new Error('City not found')
    }

    const data = await response.json()
    const current = data.current_condition?.[0]

    if (!current) {
      throw new Error('No weather data available')
    }

    return {
      city: data.nearest_area?.[0]?.areaName?.[0]?.value || city,
      country: data.nearest_area?.[0]?.country?.[0]?.value || '',
      temperature: {
        celsius: current.temp_C,
        fahrenheit: current.temp_F,
        feelsLike: current.FeelsLikeC
      },
      humidity: current.humidity,
      wind: {
        speed: current.windspeedKmph,
        direction: current.winddir16Point
      },
      description: current.weatherDesc?.[0]?.value || '',
      visibility: current.visibility,
      pressure: current.pressure
    }
  }
)
