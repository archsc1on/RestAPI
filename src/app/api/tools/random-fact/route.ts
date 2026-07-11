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

const BUILTIN_FACTS = [
  "Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.",
  "Octopuses have three hearts and blue blood.",
  "A day on Venus is longer than a year on Venus.",
  "Bananas are berries, but strawberries are not.",
  "Cows have best friends and get stressed when separated.",
  "The Eiffel Tower can be 15 cm taller during summer due to thermal expansion.",
  "A group of flamingos is called a flamboyance.",
  "The shortest war in history lasted only 38 to 45 minutes between Britain and Zanzibar."
]

export const GET = createPlugin(
  { name: 'random-fact', endpoint: '/api/tools/random-fact', costCredits: 1 },
  async (req, { searchParams }) => {
    try {
      const data = await fetchWithRetry(async () => {
        const res = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random', {
          signal: AbortSignal.timeout(10000)
        })
        if (!res.ok) throw new Error('uselessfacts API failed')
        return res.json()
      })
      return { fact: data.text || '', source: data.source || '' }
    } catch {
      return { fact: BUILTIN_FACTS[Math.floor(Math.random() * BUILTIN_FACTS.length)], source: 'builtin' }
    }
  }
)
