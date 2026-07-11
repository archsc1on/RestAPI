import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuManga } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'manga', endpoint: '/api/tools/manga', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10)

    if (!query) throw new Error('q (query) parameter required')

    const url = getKitsuUrl('/manga', {
      'filter[text]': query,
      'page[limit]': String(limit),
      'fields[manga]': 'canonicalTitle,titles,synopsis,status,chapterCount,volumeCount,ratingRank,posterImage,startDate',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuManga>>(url)

    const results = (data.data || []).map((manga) => ({
      id: manga.id,
      title: manga.attributes.canonicalTitle,
      titleJapanese: manga.attributes.titles?.ja_jp || '',
      chapters: manga.attributes.chapterCount || '?',
      volumes: manga.attributes.volumeCount || '?',
      status: manga.attributes.status,
      ratingRank: manga.attributes.ratingRank,
      synopsis: manga.attributes.synopsis?.substring(0, 200) || '',
      image: manga.attributes.posterImage?.large || manga.attributes.posterImage?.large || '',
      startDate: manga.attributes.startDate || '',
      url: `https://kitsu.io/manga/${manga.attributes.slug}`,
    }))

    return { query, total: results.length, results }
  }
)
