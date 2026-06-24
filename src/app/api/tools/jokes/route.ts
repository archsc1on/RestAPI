import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'jokes', endpoint: '/api/tools/jokes', costCredits: 1 },
  async (req, { searchParams }) => {
    const category = searchParams.get('category') || 'Programming'
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 5)

    try {
      const response = await fetch(
        `https://v2.jokeapi.dev/joke/${encodeURIComponent(category)}?type=single,twopart&amount=${count}`
      )
      if (response.ok) {
        const data = await response.json()
        const jokes = Array.isArray(data.jokes) ? data.jokes : [data]

        return {
          category,
          jokes: jokes.map((j: any) => ({
            type: j.type,
            setup: j.setup || '',
            punchline: j.joke || '',
            delivery: j.delivery || '',
            category: j.category,
            lang: j.lang || 'en'
          }))
        }
      }
    } catch {}

    const fallbackJokes = [
      { setup: 'Why do programmers prefer dark mode?', punchline: 'Because light attracts bugs.' },
      { setup: 'Why do Java developers wear glasses?', punchline: 'Because they can\'t C#.' },
      { setup: 'What\'s a programmer\'s favorite hangout place?', punchline: 'Foo Bar.' }
    ]

    return {
      category,
      jokes: fallbackJokes.slice(0, count),
      note: 'Fallback jokes'
    }
  }
)
