import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuCharacter } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'character', endpoint: '/api/tools/character', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10)

    if (!query) throw new Error('q (query) parameter required')

    const url = getKitsuUrl('/characters', {
      'filter[name]': query,
      'page[limit]': String(limit),
      'fields[characters]': 'name,names,canonicalName,description,image',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuCharacter>>(url)

    const results = (data.data || []).map((char) => ({
      id: char.id,
      name: char.attributes.canonicalName || char.attributes.name,
      nameJapanese: char.attributes.names?.ja_jp || '',
      image: char.attributes.image?.medium || '',
      about: char.attributes.description?.substring(0, 200) || '',
    }))

    return { query, total: results.length, results }
  }
)
