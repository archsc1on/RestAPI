import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'book', endpoint: '/api/tools/book', costCredits: 1 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    if (!query) throw new Error('q (query) parameter required')

    const response = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
    )
    if (!response.ok) throw new Error('Search failed')

    const data = await response.json()
    const results = (data.items || []).map((b: any) => ({
      id: b.id,
      title: b.volumeInfo?.title || '',
      authors: b.volumeInfo?.authors || [],
      description: b.volumeInfo?.description?.substring(0, 200) || '',
      publishedDate: b.volumeInfo?.publishedDate || '',
      pageCount: b.volumeInfo?.pageCount || 0,
      categories: b.volumeInfo?.categories || [],
      thumbnail: b.volumeInfo?.imageLinks?.thumbnail || '',
      language: b.volumeInfo?.language || '',
      previewLink: b.volumeInfo?.previewLink || '',
      infoLink: b.volumeInfo?.infoLink || ''
    }))

    return { query, total: results.length, results }
  }
)
