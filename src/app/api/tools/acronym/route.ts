import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'acronym', endpoint: '/api/tools/acronym', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    const acronym = text.split(/\s+/).filter(Boolean).map(w => w[0].toUpperCase()).join('')

    return { text, acronym }
  }
)
