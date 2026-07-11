import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'url-parse', endpoint: '/api/tools/url-parse', costCredits: 1 },
  async (req, { searchParams }) => {
    const urlStr = searchParams.get('url')
    if (!urlStr) throw new Error('url is required')

    const url = new URL(urlStr)
    return {
      href: url.href,
      protocol: url.protocol,
      host: url.host,
      hostname: url.hostname,
      port: url.port || null,
      pathname: url.pathname,
      search: url.search || null,
      hash: url.hash || null,
      origin: url.origin,
    }
  }
)
