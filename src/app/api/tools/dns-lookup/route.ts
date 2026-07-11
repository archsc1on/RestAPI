import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'dns-lookup', endpoint: '/api/tools/dns-lookup', costCredits: 1 },
  async (req, { searchParams }) => {
    const domain = searchParams.get('domain')

    if (!domain) throw new Error('domain parameter required')

    const types = ['A', 'AAAA', 'MX', 'CNAME', 'TXT', 'NS']
    const records: Record<string, any> = {}

    for (const type of types) {
      try {
        const response = await fetch(
          `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=${type}`,
          { signal: AbortSignal.timeout(5000) }
        )
        if (response.ok) {
          const data = await response.json()
          if (data.Answer && data.Answer.length > 0) {
            records[type] = data.Answer.map((a: any) => ({
              name: a.name,
              type: a.type,
              data: a.data,
              ttl: a.TTL
            }))
          }
        }
      } catch {}
    }

    if (Object.keys(records).length === 0) {
      throw new Error('No DNS records found')
    }

    return { domain, records }
  }
)
