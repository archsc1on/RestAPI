import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuManga } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'manga-chapters', endpoint: '/api/tools/manga-chapters', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required (Kitsu ID)')

    const url = getKitsuUrl(`/manga/${id}`, {
      'fields[manga]': 'canonicalTitle,titles,synopsis,status,chapterCount,volumeCount,ratingRank,startDate,endDate',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuManga>>(url)
    const manga = data.data?.[0]

    if (!manga) throw new Error('Manga not found')

    return {
      id: manga.id,
      title: manga.attributes.canonicalTitle,
      titleJapanese: manga.attributes.titles?.ja_jp || '',
      totalChapters: manga.attributes.chapterCount || 0,
      totalVolumes: manga.attributes.volumeCount || 0,
      status: manga.attributes.status || '',
      synopsis: manga.attributes.synopsis || '',
      ratingRank: manga.attributes.ratingRank || 0,
      startDate: manga.attributes.startDate || '',
      endDate: manga.attributes.endDate || '',
      url: `https://kitsu.io/manga/${manga.attributes.slug}`,
    }
  }
)
