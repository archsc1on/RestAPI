import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'train', endpoint: '/api/tools/train', costCredits: 1 },
  async (req, { searchParams }) => {
    const from = searchParams.get('from')
    const to = searchParams.get('to')

    if (!from) throw new Error('from parameter required')
    if (!to) throw new Error('to parameter required')

    return {
      from, to,
      journeys: [],
      message: 'The transport.rest API is currently down. Please try these alternatives:',
      alternatives: [
        { name: 'Google Maps', url: `https://www.google.com/maps/dir/${encodeURIComponent(from)}/${encodeURIComponent(to)}` },
        { name: 'Rome2Rio', url: `https://www.rome2rio.com/s/${encodeURIComponent(from)}/${encodeURIComponent(to)}` },
        { name: 'Omio', url: 'https://www.omio.com' },
        { name: 'Trainline', url: 'https://www.thetrainline.com' }
      ]
    }
  }
)
