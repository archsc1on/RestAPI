import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'space', endpoint: '/api/tools/space', costCredits: 1 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q') || ''
    const category = searchParams.get('category') || 'apod'

    if (category === 'apod') {
      const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'
      const response = await fetch(
        `https://api.nasa.gov/planetary/apod?api_key=${apiKey}${query ? `&date=${query}` : ''}`
      )
      if (!response.ok) throw new Error('Failed to fetch APOD')

      const data = await response.json()
      return {
        title: data.title || '',
        date: data.date || '',
        explanation: data.explanation || '',
        url: data.url || '',
        hdurl: data.hdurl || '',
        mediaType: data.media_type || '',
        thumbnail: data.thumbnail_url || '',
        copyright: data.copyright || '',
        source: 'NASA APOD'
      }
    }

    if (category === 'rover') {
      const apiKey = process.env.NASA_API_KEY || 'DEMO_KEY'
      const sol = searchParams.get('sol') || '1000'
      const response = await fetch(
        `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=${sol}&page=1&api_key=${apiKey}`
      )
      if (!response.ok) throw new Error('Failed to fetch Mars photos')

      const data = await response.json()
      const photos = (data.photos || []).slice(0, 5).map((p: any) => ({
        id: p.id,
        sol: p.sol,
        camera: p.camera?.full_name || '',
        imgSrc: p.img_src || '',
        earthDate: p.earth_date || '',
        rover: p.rover?.name || ''
      }))

      return { sol: parseInt(sol), total: photos.length, photos, source: 'NASA Mars Rover' }
    }

    throw new Error('Invalid category. Use: apod, rover')
  }
)
