import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuAnime } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'top-anime', endpoint: '/api/tools/top-anime', costCredits: 1 },
  async (req, { searchParams }) => {
    const sort = searchParams.get('sort') || '-ratingRank'
    const limit = parseInt(searchParams.get('limit') || '5')

    const url = getKitsuUrl('/anime', {
      'sort': sort,
      'page[limit]': String(limit),
      'fields[anime]': 'canonicalTitle,titles,synopsis,status,episodeCount,ratingRank,popularityRank,posterImage,startDate',
      'filter[nsfw]': 'false',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuAnime>>(url)

    const results = (data.data || []).map((anime) => ({
      id: anime.id,
      title: anime.attributes.canonicalTitle,
      titleJapanese: anime.attributes.titles?.ja_jp || '',
      episodes: anime.attributes.episodeCount || '?',
      status: anime.attributes.status,
      ratingRank: anime.attributes.ratingRank,
      popularityRank: anime.attributes.popularityRank,
      synopsis: anime.attributes.synopsis?.substring(0, 200) || '',
      image: anime.attributes.posterImage?.large || anime.attributes.posterImage?.large || '',
      startDate: anime.attributes.startDate || '',
      url: `https://kitsu.io/anime/${anime.attributes.slug}`,
    }))

    return { sort, total: results.length, results }
  }
)
