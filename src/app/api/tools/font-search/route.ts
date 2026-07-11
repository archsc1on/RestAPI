import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'font-search', endpoint: '/api/tools/font-search', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')
    if (!q) throw new Error('q parameter required')

    const response = await fetch(
      `https://www.googleapis.com/webfonts/v1/webfonts?family=${encodeURIComponent(q)}&key=${process.env.GOOGLE_FONTS_KEY || ''}`
    )

    if (!response.ok) throw new Error('Failed to search fonts')

    const data = await response.json()

    const results = (data.items || []).slice(0, 10).map((font: any) => ({
      family: font.family || '',
      category: font.category || '',
      subsets: font.subsets || [],
      variants: font.variants || [],
      files: font.files || {},
      version: font.version || '',
      lastModified: font.lastModified || ''
    }))

    return { query: q, total: results.length, results }
  }
)
