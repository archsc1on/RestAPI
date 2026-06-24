import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'anime-detail', endpoint: '/api/tools/anime-detail', costCredits: 2 },
  async (req, { searchParams }) => {
    const id = searchParams.get('id')
    if (!id) throw new Error('id parameter required (MAL ID)')

    const response = await fetch(`https://api.jikan.moe/v4/anime/${id}/full`)
    if (!response.ok) throw new Error('Anime not found')

    const data = await response.json()
    const anime = data.data

    return {
      id: anime.mal_id,
      title: anime.title,
      titleJapanese: anime.title_japanese || '',
      titleEnglish: anime.title_english || '',
      type: anime.type,
      episodes: anime.episodes || '?',
      status: anime.status,
      aired: anime.aired?.string || '',
      duration: anime.duration || '',
      rating: anime.rating || '',
      score: anime.score,
      rank: anime.rank,
      popularity: anime.popularity,
      members: anime.members,
      favorites: anime.favorites,
      synopsis: anime.synopsis || '',
      image: anime.images?.jpg?.large_image_url || '',
      trailer: anime.trailer?.url || '',
      genres: (anime.genres || []).map((g: any) => g.name),
      studios: (anime.studios || []).map((s: any) => s.name),
      source: anime.source || '',
      url: anime.url
    }
  }
)
