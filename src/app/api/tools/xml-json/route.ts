import { createPlugin } from '@/lib/plugin'

function parseXml(xml: string): any {
  const result: any = {}
  const tagRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g
  const selfClosingRegex = /<(\w+)([^>]*)\/>/g

  let match
  while ((match = tagRegex.exec(xml)) !== null) {
    const [, tag, attrs, content] = match
    if (result[tag]) {
      if (!Array.isArray(result[tag])) result[tag] = [result[tag]]
      result[tag].push(content.trim().startsWith('<') ? parseXml(content) : content.trim())
    } else {
      result[tag] = content.trim().startsWith('<') ? parseXml(content) : content.trim()
    }
  }

  while ((match = selfClosingRegex.exec(xml)) !== null) {
    const [, tag, attrs] = match
    if (result[tag]) {
      if (!Array.isArray(result[tag])) result[tag] = [result[tag]]
      result[tag].push(null)
    } else {
      result[tag] = null
    }
  }

  return Object.keys(result).length > 0 ? result : xml
}

export const GET = createPlugin(
  { name: 'xml-json', endpoint: '/api/tools/xml-json', costCredits: 1 },
  async (req, { searchParams }) => {
    const xml = searchParams.get('xml')

    if (!xml) throw new Error('xml parameter required')

    const json = parseXml(xml)

    return {
      json,
      formatted: JSON.stringify(json, null, 2)
    }
  }
)
