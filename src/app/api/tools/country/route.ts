import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'country', endpoint: '/api/tools/country', costCredits: 1 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    if (!query) throw new Error('q (query) parameter required')

    const response = await fetch(`https://restcountries.com/v3.1/name/${encodeURIComponent(query)}?fullText=false`)
    if (!response.ok) throw new Error('Country not found')

    const data = await response.json()
    const country = Array.isArray(data) ? data[0] : data

    if (!country) throw new Error('Country not found')

    return {
      name: country.name?.common || '',
      official: country.name?.official || '',
      capital: country.capital?.[0] || '',
      region: country.region || '',
      subregion: country.subregion || '',
      population: country.population || 0,
      area: country.area || 0,
      languages: country.languages ? Object.values(country.languages) : [],
      currencies: country.currencies ? Object.entries(country.currencies).map(([code, c]: [string, any]) => ({
        code,
        name: c.name,
        symbol: c.symbol
      })) : [],
      flag: country.flags?.png || country.flags?.svg || '',
      flagEmoji: country.flag || '',
      maps: country.maps?.googleMaps || '',
      timezones: country.timezones || [],
      car: country.car?.side || '',
      startOfWeek: country.startOfWeek || ''
    }
  }
)
