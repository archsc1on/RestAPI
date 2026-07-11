import { createPlugin } from '@/lib/plugin'
import { kitsuFetch, getKitsuUrl, KitsuResponse, KitsuCategory } from '@/lib/kitsu'

export const GET = createPlugin(
  { name: 'manga-genres', endpoint: '/api/tools/manga-genres', costCredits: 1 },
  async () => {
    const url = getKitsuUrl('/categories', {
      'page[limit]': '50',
      'sort': 'name',
    })

    const data = await kitsuFetch<KitsuResponse<KitsuCategory>>(url)

    const results = (data.data || []).map((cat) => ({
      id: cat.id,
      name: cat.attributes.name,
      slug: cat.attributes.slug,
    }))

    return { total: results.length, results }
  }
)
