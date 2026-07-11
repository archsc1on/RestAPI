import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'manga-detail', endpoint: '/api/tools/manga-detail', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required')

    const response = await fetch(`https://api.jikan.moe/v4/manga/${id}/full`)

    if (!response.ok) throw new Error('Failed to fetch manga details')

    const data = await response.json()
    const manga = data.data

    return {
      id: manga.mal_id,
      title: manga.title,
      titleJapanese: manga.title_japanese || '',
      type: manga.type,
      chapters: manga.chapters || '?',
      volumes: manga.volumes || '?',
      status: manga.status,
      score: manga.score,
      rank: manga.rank,
      synopsis: manga.synopsis || '',
      image: manga.images?.jpg?.large_image_url || manga.images?.jpg?.image_url || '',
      url: manga.url,
      genres: (manga.genres || []).map((g: any) => g.name),
      authors: (manga.authors || []).map((a: any) => a.name),
      serialization: (manga.serializations || []).map((s: any) => s.name)
    }
  }
)
