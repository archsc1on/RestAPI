import { createPlugin } from '@/lib/plugin'

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn() } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

export const GET = createPlugin(
  { name: 'population', endpoint: '/api/tools/population', costCredits: 1 },
  async (req, { searchParams }) => {
    const country = searchParams.get('country')

    if (country) {
      try {
        const data = await fetchWithRetry(async () => {
          const response = await fetch('https://countriesnow.space/api/v0.1/countries/population', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country }),
            signal: AbortSignal.timeout(10000)
          })
          if (!response.ok) throw new Error('Failed to fetch population data')
          return response.json()
        })

        if (data.error) throw new Error(data.msg || 'Country not found')

        const pops = data.data?.populationCounts || []
        const latest = pops[pops.length - 1]

        return {
          country: data.data?.country || country,
          population: latest?.value || 0,
          latestYear: latest?.year || 0,
          history: pops.map((p: any) => ({ year: p.year, value: p.value }))
        }
      } catch {
        return {
          country,
          population: 0,
          latestYear: 0,
          history: [],
          note: 'Population API unavailable, please try again later'
        }
      }
    }

    return { message: 'country parameter is required' }
  }
)
