import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'covid', endpoint: '/api/tools/covid', costCredits: 1 },
  async (req, { searchParams }) => {
    const country = searchParams.get('country') || 'all'

    try {
      const url = country === 'all'
        ? 'https://disease.sh/v3/covid-19/all'
        : `https://disease.sh/v3/covid-19/countries/${encodeURIComponent(country)}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        return {
          country: data.country || 'Global',
          cases: data.cases || 0,
          todayCases: data.todayCases || 0,
          deaths: data.deaths || 0,
          todayDeaths: data.todayDeaths || 0,
          recovered: data.recovered || 0,
          todayRecovered: data.todayRecovered || 0,
          active: data.active || 0,
          critical: data.critical || 0,
          casesPerMillion: data.casesPerOneMillion || 0,
          tests: data.tests || 0,
          updated: data.updated ? new Date(data.updated).toISOString() : ''
        }
      }
    } catch {}

    throw new Error('Failed to fetch COVID data')
  }
)
