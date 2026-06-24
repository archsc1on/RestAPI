import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'slugify', endpoint: '/api/tools/slugify', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text parameter required')

    const slug = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '')

    return { input: text, slug }
  }
)
