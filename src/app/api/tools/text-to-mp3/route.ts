import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'text-to-mp3', endpoint: '/api/tools/text-to-mp3', costCredits: 2 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    const lang = searchParams.get('lang') || 'id'

    if (!text) throw new Error('text parameter required')
    if (text.length > 5000) throw new Error('Text max 5000 characters')

    const encoded = encodeURIComponent(text)
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encoded}&tl=${lang}&client=tw-ob`

    const response = await fetch(audioUrl)
    if (!response.ok) throw new Error('Failed to generate audio')

    return {
      text,
      lang,
      downloadUrl: audioUrl,
      format: 'mp3',
      note: 'Open downloadUrl to play or download the MP3 file'
    }
  }
)
