import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'flight', endpoint: '/api/tools/flight', costCredits: 1 },
  async (req, { searchParams }) => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')
    const date = searchParams.get('date')

    if (!from) throw new Error('from parameter required')
    if (!to) throw new Error('to parameter required')
    if (!date) throw new Error('date parameter required')

    const apiKey = process.env.AERODATABOX_API_KEY
    if (!apiKey) {
      return { message: 'Aerodatabox API key not configured', from, to, date, hint: 'Set AERODATABOX_API_KEY in .env' }
    }

    const response = await fetch(
      `https://aerodatabox.p.rapidapi.com/flights/instances/dep/${encodeURIComponent(from)}/${date}?api_key=${apiKey}`,
      { headers: { 'X-RapidAPI-Key': apiKey, 'X-RapidAPI-Host': 'aerodatabox.p.rapidapi.com' } }
    )

    if (!response.ok) {
      return {
        message: 'AeroDataBox API requires an API key',
        from, to, date,
        hint: 'Set AERODATABOX_API_KEY environment variable'
      }
    }

    const data = await response.json()
    return { from, to, date, flights: data.data || [] }
  }
)
