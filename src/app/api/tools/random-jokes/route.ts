import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'random-jokes', endpoint: '/api/tools/random-jokes', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '5'), 10)
    const jokes = [
      { setup: "Why don't scientists trust atoms?", punchline: "Because they make up everything!" },
      { setup: "Why did the scarecrow win an award?", punchline: "Because he was outstanding in his field!" },
      { setup: "What do you call a fake noodle?", punchline: "An impasta!" },
      { setup: "Why did the math book look so sad?", punchline: "Because it had too many problems." },
      { setup: "What do you call a bear with no teeth?", punchline: "A gummy bear!" },
      { setup: "Why don't eggs tell jokes?", punchline: "They'd crack each other up!" },
      { setup: "What do you call a dog that does magic?", punchline: "A Labracadabrador!" },
      { setup: "Why did the bicycle fall over?", punchline: "Because it was two-tired!" },
      { setup: "What did the ocean say to the beach?", punchline: "Nothing, it just waved." },
      { setup: "Why do programmers prefer dark mode?", punchline: "Because light attracts bugs!" }
    ]
    const selected = jokes.sort(() => Math.random() - 0.5).slice(0, count)
    return { count: selected.length, jokes: selected }
  }
)
