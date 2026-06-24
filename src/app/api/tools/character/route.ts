import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'character', endpoint: '/api/tools/character', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10)

    if (!query) throw new Error('q (query) parameter required')

    const response = await fetch(`https://api.jikan.moe/v4/characters?q=${encodeURIComponent(query)}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to search characters')

    const data = await response.json()
    const results = (data.data || []).map((char: any) => ({
      id: char.mal_id,
      name: char.name,
      nameKanji: char.name_kanji || '',
      nicknames: char.nicknames || [],
      favorites: char.favorites,
      image: char.images?.jpg?.image_url || '',
      about: char.about?.substring(0, 200) || '',
      url: char.url
    }))

    return { query, total: results.length, results }
  }
)
