import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'covid-country', endpoint: '/api/tools/covid-country', costCredits: 1 },
  async (req, { searchParams }) => {
    const response = await fetch('https://disease.sh/v3/covid-19/countries?sort=cases')
    if (!response.ok) throw new Error('Failed to fetch country data')

    const data = await response.json()
    const countries = (data || []).slice(0, 30).map((c: any) => ({
      country: c.country,
      cases: c.cases,
      todayCases: c.todayCases,
      deaths: c.deaths,
      todayDeaths: c.todayDeaths,
      recovered: c.recovered,
      active: c.active,
      flag: c.countryInfo?.flag || ''
    }))

    return { total: countries.length, countries }
  }
)
