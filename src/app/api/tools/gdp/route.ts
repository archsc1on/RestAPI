import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'gdp', endpoint: '/api/tools/gdp', costCredits: 1 },
  async (req, { searchParams }) => {
    const country = searchParams.get('country')

    if (!country) throw new Error('country parameter required')

    const countryResp = await fetch(
      `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!countryResp.ok) throw new Error('Country not found')

    const countryData = await countryResp.json()
    const c = Array.isArray(countryData) ? countryData[0] : countryData

    if (!c) throw new Error('Country not found')

    return {
      country: c.name?.common || c.name,
      population: c.population,
      area: c.area,
      region: c.region,
      subregion: c.subregion,
      gdpNote: 'GDP data requires World Bank API. This returns country economic indicators available from REST Countries.',
      currencies: Object.entries(c.currencies || {}).map(([code, info]: [string, any]) => ({
        code,
        name: info.name,
        symbol: info.symbol
      }))
    }
  }
)
