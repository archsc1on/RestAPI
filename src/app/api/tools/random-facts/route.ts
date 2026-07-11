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
  'Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.',
  'Octopuses have three hearts and blue blood.',
  'The Eiffel Tower can be 15 cm taller during summer due to thermal expansion.',
  'A group of flamingos is called a flamboyance.',
  'Bananas are berries, but strawberries are not.',
  'The shortest war in history lasted only 38 to 45 minutes between Britain and Zanzibar.',
  'A day on Venus is longer than a year on Venus.',
  'Cows have best friends and get stressed when separated.'
]

export const GET = createPlugin(
  { name: 'random-facts', endpoint: '/api/tools/random-facts', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 10)

    const facts: string[] = []
    for (let i = 0; i < count; i++) {
      try {
        const data = await fetchWithRetry(async () => {
          const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random', {
            signal: AbortSignal.timeout(10000)
          })
          if (!response.ok) throw new Error('uselessfacts API failed')
          return response.json()
        })
        facts.push(data.text || '')
      } catch {}
    }

    if (facts.length === 0) {
      const shuffled = [...BUILTIN_FACTS].sort(() => Math.random() - 0.5)
      for (let i = 0; i < count; i++) {
        facts.push(shuffled[i % shuffled.length])
      }
    }

    return { count: facts.length, facts, ...(facts.length < count ? { note: 'Using built-in facts due to API unavailability' } : {}) }
  }
)
