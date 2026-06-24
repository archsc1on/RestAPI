import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'manga', endpoint: '/api/tools/manga', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    const limit = Math.min(parseInt(searchParams.get('limit') || '5'), 10)

    if (!query) throw new Error('q (query) parameter required')

    const response = await fetch(`https://api.jikan.moe/v4/manga?q=${encodeURIComponent(query)}&limit=${limit}`)
    if (!response.ok) throw new Error('Failed to search manga')

    const data = await response.json()
    const results = (data.data || []).map((manga: any) => ({
      id: manga.mal_id,
      title: manga.title,
      titleJapanese: manga.title_japanese || '',
      type: manga.type,
      chapters: manga.chapters || '?',
      volumes: manga.volumes || '?',
      status: manga.status,
      score: manga.score,
      rank: manga.rank,
      synopsis: manga.synopsis?.substring(0, 200) || '',
      image: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || '',
      authors: (manga.authors || []).map((a: any) => a.name),
      genres: (manga.genres || []).map((g: any) => g.name),
      url: manga.url
    }))

    return { query, total: results.length, results }
  }
)
