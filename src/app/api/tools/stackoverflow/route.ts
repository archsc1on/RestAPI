import { createPlugin } from '@/lib/plugin'

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn() } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

export const GET = createPlugin(
  { name: 'stackoverflow', endpoint: '/api/tools/stackoverflow', costCredits: 1 },
  async (req, { searchParams }) => {
    const q = searchParams.get('q')

    if (!q) throw new Error('q parameter required')

    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch(
          `https://api.stackexchange.com/2.3/search/advanced?q=${encodeURIComponent(q)}&order=desc&sort=relevance&site=stackoverflow&pagesize=10`,
          { signal: AbortSignal.timeout(10000) }
        )
        if (!response.ok) throw new Error('Failed to search Stack Overflow')
        return response.json()
      })

      const questions = (data.items || []).map((q: any) => ({
        title: q.title,
        url: q.link,
        score: q.score,
        views: q.view_count,
        answers: q.answer_count,
        accepted: q.accepted_answer_id !== undefined,
        tags: q.tags,
        createdAt: new Date(q.creation_date * 1000).toISOString()
      }))

      return { query: searchParams.get('q'), count: questions.length, questions }
    } catch {
      return {
        query: q,
        count: 0,
        questions: [],
        note: 'Stack Exchange API unavailable, please try again later'
      }
    }
  }
)
