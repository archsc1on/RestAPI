// src/app/api/tools/translate/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'translate', endpoint: '/api/tools/translate', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    const to = searchParams.get('to') || 'en'
    const from = searchParams.get('from') || 'auto'

    if (!text) throw new Error('text parameter required')
    if (text.length > 5000) throw new Error('Text max 5000 characters')

    // Use Google Translate free API
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`

    const response = await fetch(url)
    const data = await response.json()

    const translated = data[0]?.map((item: any[]) => item[0]).join('') || text

    return {
      text,
      translated,
      from: data[2] || from,
      to
    }
  }
)
