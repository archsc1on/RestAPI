import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'earthquake', endpoint: '/api/tools/earthquake', costCredits: 1 },
  async (req, { searchParams }) => {
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 20)

    const response = await fetch(
      `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/significant_week.geojson`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('Failed to fetch earthquake data')

    const data = await response.json()
    const earthquakes = (data.features || []).slice(0, limit).map((eq: any) => ({
      place: eq.properties.place,
      magnitude: eq.properties.mag,
      time: new Date(eq.properties.time).toISOString(),
      type: eq.properties.type,
      url: eq.properties.url,
      coordinates: {
        lat: eq.geometry.coordinates[1],
        lon: eq.geometry.coordinates[0],
        depth: eq.geometry.coordinates[2]
      }
    }))

    return { count: earthquakes.length, earthquakes }
  }
)
