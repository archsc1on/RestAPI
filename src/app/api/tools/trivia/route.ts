import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'trivia', endpoint: '/api/tools/trivia', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 10)
    const category = searchParams.get('category') || ''
    const difficulty = searchParams.get('difficulty') || ''

    try {
      let url = `https://opentdb.com/api.php?amount=${count}`
      if (category) url += `&category=${category}`
      if (difficulty) url += `&difficulty=${difficulty}`

      const response = await fetch(url)
      if (response.ok) {
        const data = await response.json()
        const questions = (data.results || []).map((q: any) => ({
          question: decodeHtml(q.question),
          answer: decodeHtml(q.correct_answer),
          incorrectAnswers: (q.incorrect_answers || []).map(decodeHtml),
          category: q.category,
          difficulty: q.difficulty,
          type: q.type
        }))

        return {
          count: questions.length,
          categories: [
            { id: 9, name: 'General Knowledge' }, { id: 10, name: 'Entertainment: Books' },
            { id: 11, name: 'Entertainment: Film' }, { id: 12, name: 'Entertainment: Music' },
            { id: 14, name: 'Entertainment: Television' }, { id: 17, name: 'Science & Nature' },
            { id: 18, name: 'Science: Computers' }, { id: 19, name: 'Science: Mathematics' },
            { id: 21, name: 'Sports' }, { id: 22, name: 'Geography' },
            { id: 23, name: 'History' }, { id: 27, name: 'Animals' }
          ],
          questions
        }
      }
    } catch {}

    throw new Error('Failed to fetch trivia questions')
  }
)

function decodeHtml(html: string): string {
  return html
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}
