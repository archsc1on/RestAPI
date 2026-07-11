import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuAnime } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'anime', endpoint: '/api/tools/anime', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')

    if (!query) throw new Error('q (query) parameter required')

    const url = getKitsuUrl('/anime', {
      'filter[text]': query,
      'page[limit]': '5',
      'fields[anime]': 'canonicalTitle,titles,synopsis,status,episodeCount,posterImage,ratingRank,startDate',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuAnime>>(url)

    const results = (data.data || []).map((anime) => ({
      id: anime.id,
      title: anime.attributes.canonicalTitle,
      titleJapanese: anime.attributes.titles?.ja_jp || '',
      type: anime.attributes.status,
      episodes: anime.attributes.episodeCount || '?',
      status: anime.attributes.status,
      ratingRank: anime.attributes.ratingRank,
      synopsis: anime.attributes.synopsis?.substring(0, 200) || '',
      image: anime.attributes.posterImage?.large || anime.attributes.posterImage?.large || '',
      startDate: anime.attributes.startDate || '',
    }))

    return {
      query,
      total: results.length,
      results
    }
  }
)
