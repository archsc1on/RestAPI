import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'csv-json', endpoint: '/api/tools/csv-json', costCredits: 1 },
  async (req, { searchParams }) => {
    const csv = searchParams.get('csv')

    if (!csv) throw new Error('csv parameter required')

    const lines = csv.trim().split('\n')
    if (lines.length < 2) throw new Error('CSV must have at least a header row and one data row')

    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const rows = lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      const obj: Record<string, string> = {}
      headers.forEach((h, i) => { obj[h] = values[i] || '' })
      return obj
    })

    return {
      headers,
      rowCount: rows.length,
      data: rows
    }
  }
)
