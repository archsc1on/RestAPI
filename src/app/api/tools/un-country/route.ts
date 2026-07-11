import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'un-country', endpoint: '/api/tools/un-country', costCredits: 1 },
  async (req, { searchParams }) => {
    const country = searchParams.get('country')

    if (!country) throw new Error('country parameter required')

    let data: any
    try {
      const response = await fetch(
        `https://restcountries.com/v3.1/name/${encodeURIComponent(country)}`,
        { signal: AbortSignal.timeout(10000) }
      )
      if (response.ok) data = await response.json()
    } catch {}

    if (!data || !Array.isArray(data) || data.length === 0) {
      try {
        const response = await fetch(
          `https://restcountries.com/v3.1/alpha/${encodeURIComponent(country)}`,
          { signal: AbortSignal.timeout(10000) }
        )
        if (response.ok) {
          const result = await response.json()
          data = Array.isArray(result) ? result : [result]
        }
      } catch {}
    }

    if (!data || !Array.isArray(data) || data.length === 0) throw new Error('Country not found')

    const c = data[0]
    if (!c || c.success === false) throw new Error('Country not found')

    return {
      name: c.name?.common,
      officialName: c.name?.official,
      capital: c.capital?.[0],
      region: c.region,
      subregion: c.subregion,
      population: c.population,
      area: c.area,
      languages: Object.values(c.languages || {}),
      currencies: Object.entries(c.currencies || {}).map(([code, info]: [string, any]) => ({
        code,
        name: info.name,
        symbol: info.symbol
      })),
      flag: c.flag,
      maps: c.maps?.googleMaps,
      unMember: c.unMember,
      timezones: c.timezones,
      tld: c.tld,
      cca2: c.cca2,
      cca3: c.cca3
    }
  }
)
