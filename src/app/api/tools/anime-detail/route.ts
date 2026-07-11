import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuAnime } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'anime-detail', endpoint: '/api/tools/anime-detail', costCredits: 2 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required (Kitsu ID)')

    const url = getKitsuUrl(`/anime/${id}`, {
      'fields[anime]': 'canonicalTitle,titles,synopsis,status,episodeCount,startDate,endDate,season,ratingRank,popularityRank,posterImage,coverImage',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuAnime>>(url)
    const anime = data.data?.[0]

    if (!anime) throw new Error('Anime not found')

    return {
      id: anime.id,
      title: anime.attributes.canonicalTitle,
      titleJapanese: anime.attributes.titles?.ja_jp || '',
      titleEnglish: anime.attributes.titles?.en || '',
      status: anime.attributes.status,
      episodes: anime.attributes.episodeCount || '?',
      startDate: anime.attributes.startDate || '',
      endDate: anime.attributes.endDate || '',
      season: anime.attributes.season || '',
      ratingRank: anime.attributes.ratingRank,
      popularityRank: anime.attributes.popularityRank,
      synopsis: anime.attributes.synopsis || '',
      image: anime.attributes.coverImage?.original || anime.attributes.posterImage?.large || '',
      posterImage: anime.attributes.posterImage?.large || '',
      url: `https://kitsu.io/anime/${anime.attributes.slug}`,
    }
  }
)
