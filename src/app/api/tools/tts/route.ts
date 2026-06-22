// src/app/api/tools/tts/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'tts', endpoint: '/api/tools/tts', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    const lang = searchParams.get('lang') || 'id'

    if (!text) throw new Error('text parameter required')
    if (text.length > 2000) throw new Error('Text max 2000 characters')

    // Use Google TTS free endpoint
    const encoded = encodeURIComponent(text)
    const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`

    return {
      text,
      lang,
      audio: ttsUrl,
      note: 'Open audio URL in browser to play'
    }
  }
)
