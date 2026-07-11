import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'random-advice', endpoint: '/api/tools/random-advice', costCredits: 1 },
  async (req, { searchParams }) => {
    try {
      const res = await fetch('https://api.adviceslip.com/advice')
      if (res.ok) {
        const data = await res.json()
        return { advice: data.slip?.advice || '', id: data.slip?.id }
      }
    } catch {}

    const advices = [
      "The best time to plant a tree was 20 years ago. The second best time is now.",
      "Don't count the days, make the days count.",
      "Be yourself; everyone else is already taken.",
      "The only impossible journey is the one you never begin.",
      "Life is 10% what happens to you and 90% how you react to it."
    ]
    const advice = advices[Math.floor(Math.random() * advices.length)]
    return { advice, id: Math.floor(Math.random() * 1000) }
  }
)
