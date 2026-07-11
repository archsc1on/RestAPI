import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'character-detail', endpoint: '/api/tools/character-detail', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required')

    const response = await fetch(`https://api.jikan.moe/v4/characters/${id}/full`)

    if (!response.ok) throw new Error('Failed to fetch character details')

    const data = await response.json()
    const char = data.data

    return {
      id: char.mal_id,
      name: char.name,
      nameKanji: char.name_kanji || '',
      nickname: char.nicknames || [],
      favorites: char.favorites || 0,
      about: char.about || '',
      image: char.images?.jpg?.image_url || '',
      url: char.url,
      anime: (char.anime || []).map((a: any) => ({
        id: a.anime?.mal_id,
        title: a.anime?.title,
        role: a.role
      })),
      manga: (char.manga || []).map((m: any) => ({
        id: m.manga?.mal_id,
        title: m.manga?.title,
        role: m.role
      })),
      voices: (char.voices || []).map((v: any) => ({
        id: v.person?.mal_id,
        name: v.person?.name,
        language: v.language
      }))
    }
  }
)
