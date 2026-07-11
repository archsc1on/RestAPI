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
  { name: 'rest-country', endpoint: '/api/tools/rest-country', costCredits: 1 },
  async (req, { searchParams }) => {
    const country = searchParams.get('country')
    const code = searchParams.get('code')

    if (!country && !code) throw new Error('country or code parameter required')

    let query = country
    if (code && !country) {
      try {
        const isoData = await fetchWithRetry(async () => {
          const isoRes = await fetch('https://countriesnow.space/api/v0.1/countries/iso', {
            signal: AbortSignal.timeout(10000)
          })
          if (!isoRes.ok) throw new Error('ISO API failed')
          return isoRes.json()
        })
        const match = isoData.data?.find((c: any) => c.Iso2?.toLowerCase() === code.toLowerCase())
        query = match?.name || code
      } catch {
        query = code
      }
    }

    try {
      const [popData, flagData] = await fetchWithRetry(async () => {
        const [popRes, flagRes] = await Promise.all([
          fetch('https://countriesnow.space/api/v0.1/countries/population', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ country: query }),
            signal: AbortSignal.timeout(10000)
          }),
          fetch('https://countriesnow.space/api/v0.1/countries/flag/images', {
            signal: AbortSignal.timeout(10000)
          })
        ])
        if (!popRes.ok) throw new Error('Failed to fetch population data')
        return Promise.all([popRes.json(), flagRes.ok ? flagRes.json() : Promise.resolve(null)])
      })

      if (popData.error) throw new Error(popData.msg || 'Country not found')

      let flag = ''
      if (flagData) {
        flag = flagData.data?.find((f: any) =>
          f.name?.toLowerCase() === (popData.data?.country || '').toLowerCase()
        )?.flag || ''
      }

      const pops = popData.data?.populationCounts || []
      const latest = pops[pops.length - 1]

      return {
        name: popData.data?.country || query,
        code: code || '',
        population: latest?.value || 0,
        populationHistory: pops.map((p: any) => ({ year: p.year, value: p.value })),
        flag
      }
    } catch {
      return {
        name: query || code || 'Unknown',
        code: code || '',
        population: 0,
        populationHistory: [],
        flag: '',
        note: 'Countries API unavailable, please try again later'
      }
    }
  }
)
