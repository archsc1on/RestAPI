import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'json-csv', endpoint: '/api/tools/json-csv', costCredits: 1 },
  async (req, { searchParams }) => {
    const json = searchParams.get('json')

    if (!json) throw new Error('json parameter required')

    let parsed
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new Error('Invalid JSON')
    }

    const arr = Array.isArray(parsed) ? parsed : [parsed]
    if (arr.length === 0) throw new Error('Empty array')

    const headers = [...new Set(arr.flatMap(obj => Object.keys(obj)))]
    const csvRows = [
      headers.join(','),
      ...arr.map(obj => headers.map(h => `"${String(obj[h] ?? '').replace(/"/g, '""')}"`).join(','))
    ]

    return {
      csv: csvRows.join('\n'),
      headers,
      rowCount: arr.length
    }
  }
)
