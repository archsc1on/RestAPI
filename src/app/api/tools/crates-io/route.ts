import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'crates-io', endpoint: '/api/tools/crates-io', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')

    if (!q) throw new Error('q parameter required')

    const response = await fetch(
      `https://crates.io/api/v1/crates?q=${encodeURIComponent(q)}&per_page=10`,
      {
        headers: { 'User-Agent': 'RESTAPI-XENDIT/1.0' },
        signal: AbortSignal.timeout(10000)
      }
    )

    if (!response.ok) throw new Error('Failed to search crates.io')

    const data = await response.json()
    const crates = (data.crates || []).map((c: any) => ({
      name: c.name,
      description: c.description,
      version: c.newest_version,
      downloads: c.downloads,
      recentDownloads: c.recent_downloads,
      homepage: c.homepage,
      repository: c.repository
    }))

    return { query: q, count: crates.length, crates }
  }
)
