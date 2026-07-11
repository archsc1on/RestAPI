import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuManga } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'manga-detail', endpoint: '/api/tools/manga-detail', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required (Kitsu ID)')

    const url = getKitsuUrl(`/manga/${id}`, {
      'fields[manga]': 'canonicalTitle,titles,synopsis,status,chapterCount,volumeCount,ratingRank,popularityRank,posterImage,coverImage,startDate,endDate',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuManga>>(url)
    const manga = data.data?.[0]

    if (!manga) throw new Error('Manga not found')

    return {
      id: manga.id,
      title: manga.attributes.canonicalTitle,
      titleJapanese: manga.attributes.titles?.ja_jp || '',
      chapters: manga.attributes.chapterCount || '?',
      volumes: manga.attributes.volumeCount || '?',
      status: manga.attributes.status,
      ratingRank: manga.attributes.ratingRank,
      popularityRank: manga.attributes.popularityRank,
      synopsis: manga.attributes.synopsis || '',
      image: manga.attributes.coverImage?.original || manga.attributes.posterImage?.large || '',
      posterImage: manga.attributes.posterImage?.large || '',
      startDate: manga.attributes.startDate || '',
      endDate: manga.attributes.endDate || '',
      url: `https://kitsu.io/manga/${manga.attributes.slug}`,
    }
  }
)
