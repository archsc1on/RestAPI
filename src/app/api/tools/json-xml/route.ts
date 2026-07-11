import { createPlugin } from '@/lib/plugin'

function jsonToXml(obj: any, indent: number = 0): string {
  const pad = '  '.repeat(indent)

  if (obj === null || obj === undefined) return `${pad}<element/>`

  if (typeof obj !== 'object') return `${pad}${escapeXml(String(obj))}`

  if (Array.isArray(obj)) {
    return obj.map(item => jsonToXml(item, indent)).join('\n')
  }

  const entries = Object.entries(obj)
  if (entries.length === 0) return `${pad}<element/>`

  let xml = ''
  for (const [key, value] of entries) {
    const safeKey = key.replace(/[^a-zA-Z0-9_-]/g, '_')
    if (value === null || value === undefined) {
      xml += `${pad}<${safeKey}/>\n`
    } else if (Array.isArray(value)) {
      for (const item of value) {
        xml += `${pad}<${safeKey}>\n${jsonToXml(item, indent + 1)}${pad}</${safeKey}>\n`
      }
    } else if (typeof value === 'object') {
      xml += `${pad}<${safeKey}>\n${jsonToXml(value, indent + 1)}${pad}</${safeKey}>\n`
    } else {
      xml += `${pad}<${safeKey}>${escapeXml(String(value))}</${safeKey}>\n`
    }
  }
  return xml
}

function escapeXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export const GET = createPlugin(
  { name: 'json-xml', endpoint: '/api/tools/json-xml', costCredits: 1 },
  async (req, { searchParams }) => {
    const json = searchParams.get('json')

    if (!json) throw new Error('json parameter required')

    let parsed
    try {
      parsed = JSON.parse(json)
    } catch {
      throw new Error('Invalid JSON')
    }

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n${jsonToXml(parsed).trim()}`

    return {
      xml,
      root: typeof parsed === 'object' && !Array.isArray(parsed) ? Object.keys(parsed)[0] || 'root' : 'root'
    }
  }
)
