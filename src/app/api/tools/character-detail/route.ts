import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuCharacter } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'character-detail', endpoint: '/api/tools/character-detail', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required (Kitsu ID)')

    const url = getKitsuUrl(`/characters/${id}`, {
      'fields[characters]': 'name,names,canonicalName,description,image',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuCharacter>>(url)
    const char = data.data?.[0]

    if (!char) throw new Error('Character not found')

    return {
      id: char.id,
      name: char.attributes.canonicalName || char.attributes.name,
      nameJapanese: char.attributes.names?.ja_jp || '',
      image: char.attributes.image?.large || char.attributes.image?.medium || '',
      about: char.attributes.description || '',
    }
  }
)
