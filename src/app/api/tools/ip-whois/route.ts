import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'ip-whois', endpoint: '/api/tools/ip-whois', costCredits: 1 },
  async (req, { searchParams }) => {
    const ip = searchParams.get('ip')

    if (!ip) throw new Error('ip parameter required')

    const response = await fetch(
      `https://ipinfo.io/${encodeURIComponent(ip)}/json`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('WHOIS lookup failed')

    const data = await response.json()

    if (data.error) throw new Error(data.error)

    return {
      ip: data.ip,
      hostname: data.hostname,
      city: data.city,
      region: data.region,
      country: data.country,
      location: data.loc,
      organization: data.org,
      postal: data.postal,
      timezone: data.timezone,
      readme: data.readme
    }
  }
)
