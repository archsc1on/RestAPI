import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'definition', endpoint: '/api/tools/definition', costCredits: 1 },
  async (req, { searchParams }) => {
    const word = searchParams.get('word')
    if (!word) throw new Error('word parameter required')

    const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word)}`)
    if (!response.ok) throw new Error(`No definition found for "${word}"`)

    const data = await response.json()
    const entry = data[0]

    const meanings = (entry.meanings || []).map((m: any) => ({
      partOfSpeech: m.partOfSpeech,
      definitions: (m.definitions || []).slice(0, 3).map((d: any) => ({
        definition: d.definition,
        example: d.example || '',
        synonyms: d.synonyms?.slice(0, 3) || []
      }))
    }))

    return {
      word: entry.word,
      phonetic: entry.phonetic || '',
      audio: entry.phonetics?.find((p: any) => p.audio)?.audio || '',
      origin: entry.origin || '',
      meanings
    }
  }
)
