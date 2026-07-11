import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'wallpaper', endpoint: '/api/tools/wallpaper', costCredits: 1 },
  async (req, { searchParams }) => {
    const categories = searchParams.get('categories') || 'general'
    const purity = searchParams.get('purity') || 'sfw'

    const response = await fetch(
      `https://wallhaven.cc/api/v1/search?categories=${categories}&purity=${purity}&sorting=random&ai_art_filter=0`
    )

    if (!response.ok) throw new Error('Failed to fetch wallpaper')

    const data = await response.json()
    const wallpaper = data.data?.[0]

    if (!wallpaper) throw new Error('No wallpaper found')

    return {
      id: wallpaper.id,
      url: wallpaper.path,
      resolution: wallpaper.resolution,
      ratio: wallpaper.ratio,
      category: wallpaper.category,
      purity: wallpaper.purity,
      colors: wallpaper.colors || [],
      thumbs: wallpaper.thumbs || {}
    }
  }
)
