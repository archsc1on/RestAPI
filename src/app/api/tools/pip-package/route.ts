import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'pip-package', endpoint: '/api/tools/pip-package', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')

    if (!q) throw new Error('q parameter required')

    const response = await fetch(
      `https://pypi.org/pypi/${encodeURIComponent(q)}/json`,
      { signal: AbortSignal.timeout(10000) }
    )

    if (!response.ok) throw new Error('Package not found')

    const data = await response.json()
    const info = data.info

    return {
      name: info.name,
      version: info.version,
      summary: info.summary,
      author: info.author,
      license: info.license,
      homePage: info.home_page || info.project_url,
      pythonVersion: info.requires_python,
      classifiers: info.classifier?.slice(0, 5),
      requiresDist: info.requires_dist?.slice(0, 10)
    }
  }
)
