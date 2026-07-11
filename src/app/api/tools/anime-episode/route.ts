import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuEpisode } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'anime-episode', endpoint: '/api/tools/anime-episode', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required (Kitsu ID)')
    const page = parseInt(searchParams.get('page') || '1')

    const url = getKitsuUrl(`/anime/${id}/episodes`, {
      'page[limit]': '20',
      'page[offset]': String((page - 1) * 20),
      'sort': 'number',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuEpisode>>(url)

    const results = (data.data || []).map((ep) => ({
      id: ep.id,
      number: ep.attributes.number,
      title: ep.attributes.canonicalTitle || '',
      titleJapanese: ep.attributes.titles?.ja_jp || '',
      duration: ep.attributes.length || 0,
      aired: ep.attributes.airedAt || '',
      synopsis: ep.attributes.synopsis || '',
    }))

    return {
      page,
      total: data.meta?.count || results.length,
      results
    }
  }
)
