import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'html-text', endpoint: '/api/tools/html-text', costCredits: 1 },
  async (req, { searchParams }) => {
    const html = searchParams.get('html')
    if (!html) throw new Error('html is required')

    const text = html.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
      .trim()

    return { html, text }
  }
)
