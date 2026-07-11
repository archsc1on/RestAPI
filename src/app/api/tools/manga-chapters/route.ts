import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'manga-chapters', endpoint: '/api/tools/manga-chapters', costCredits: 1 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required')

    const response = await fetch(`https://api.jikan.moe/v4/manga/${id}/full`)

    if (!response.ok) throw new Error('Failed to fetch manga chapters')

    const data = await response.json()

    const manga = data.data || {}

    return {
      id: manga.mal_id || parseInt(id),
      title: manga.title || '',
      titleEnglish: manga.title_english || '',
      totalChapters: manga.chapters || 0,
      totalVolumes: manga.volumes || 0,
      status: manga.status || '',
      type: manga.type || '',
      synopsis: manga.synopsis || '',
      score: manga.score || 0,
      genres: (manga.genres || []).map((g: any) => g.name),
      url: manga.url || ''
    }
  }
)
