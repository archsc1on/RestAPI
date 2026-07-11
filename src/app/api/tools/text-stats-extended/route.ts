import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'text-stats-extended', endpoint: '/api/tools/text-stats-extended', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')

    if (!text) throw new Error('text parameter required')

    const words = text.trim().split(/\s+/).filter(Boolean)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1)
    const avgSyllablesPerWord = syllables / Math.max(words.length, 1)

    const fleschReadingEase = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord
    const fleschKincaidGrade = 0.39 * avgWordsPerSentence + 11.8 * avgSyllablesPerWord - 15.59

    let readabilityLevel = 'Very difficult'
    if (fleschReadingEase >= 80) readabilityLevel = 'Very easy'
    else if (fleschReadingEase >= 70) readabilityLevel = 'Easy'
    else if (fleschReadingEase >= 60) readabilityLevel = 'Standard'
    else if (fleschReadingEase >= 50) readabilityLevel = 'Difficult'
    else if (fleschReadingEase >= 30) readabilityLevel = 'Very difficult'

    return {
      characters: text.length,
      charactersNoSpaces: text.replace(/\s/g, '').length,
      words: words.length,
      sentences: sentences.length,
      paragraphs: text.split(/\n\n+/).filter(p => p.trim().length > 0).length,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 100) / 100,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 100) / 100,
      fleschReadingEase: Math.round(fleschReadingEase * 100) / 100,
      fleschKincaidGrade: Math.round(fleschKincaidGrade * 100) / 100,
      readabilityLevel
    }
  }
)

function countSyllables(word: string): number {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 3) return 1

  let count = 0
  const vowels = 'aeiouy'
  let prevVowel = false

  for (const char of word) {
    const isVowel = vowels.includes(char)
    if (isVowel && !prevVowel) count++
    prevVowel = isVowel
  }

  if (word.endsWith('e')) count--
  if (word.endsWith('le') && word.length > 2 && !vowels.includes(word[word.length - 3])) count++

  return Math.max(count, 1)
}
