import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'character-voices', endpoint: '/api/tools/character-voices', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required')

    const response = await fetch(`https://api.jikan.moe/v4/characters/${id}/voices`)

    if (!response.ok) throw new Error('Failed to fetch character voices')

    const data = await response.json()

    const voices = (data.data || []).map((v: any) => ({
      id: v.person?.mal_id,
      name: v.person?.name || '',
      image: v.person?.images?.jpg?.image_url || '',
      language: v.language || '',
      url: v.person?.url || ''
    }))

    return { id: parseInt(id), total: voices.length, voices }
  }
)
