import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'whois-domain', endpoint: '/api/tools/whois-domain', costCredits: 1 },
  async (req, { searchParams }) => {
    const domain = searchParams.get('domain')

    if (!domain) throw new Error('domain parameter required')

    const response = await fetch(
      `https://rdap.org/domain/${encodeURIComponent(domain)}`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('WHOIS lookup failed')

    const data = await response.json()

    const getEvent = (name: string) => {
      const ev = data.events?.find((e: any) => e.eventAction === name)
      return ev?.eventDate
    }

    const statuses = data.status || []

    return {
      domain: data.ldhName || domain,
      registryDomainId: data.handle,
      registrar: data.entities?.[0]?.vcardArray?.[1]?.find((v: any) => v[0] === 'fn')?.[3] || 'Unknown',
      status: statuses,
      created: getEvent('registration'),
      updated: getEvent('last changed'),
      expiration: getEvent('expiration'),
      nameservers: data.nameservers?.map((n: any) => n.ldhName) || []
    }
  }
)
