import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'ascii-art', endpoint: '/api/tools/ascii-art', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    if (!text) throw new Error('text is required')

    const url = `https://text-image.com/image.php?text=${encodeURIComponent(text)}&color=black&bg_color=white&size=3`

    return { text, url }
  }
)
