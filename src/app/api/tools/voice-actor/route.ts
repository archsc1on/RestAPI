import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'voice-actor', endpoint: '/api/tools/voice-actor', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')
    if (!q) throw new Error('q parameter required')

    const response = await fetch(`https://api.jikan.moe/v4/people?q=${encodeURIComponent(q)}&limit=5`)

    if (!response.ok) throw new Error('Failed to search voice actors')

    const data = await response.json()

    const results = (data.data || []).map((person: any) => ({
      id: person.mal_id,
      name: person.name,
      givenName: person.given_name || '',
      familyName: person.family_name || '',
      image: person.images?.jpg?.image_url || '',
      url: person.url,
      favorites: person.favorites || 0
    }))

    return { query: q, total: results.length, results }
  }
)
