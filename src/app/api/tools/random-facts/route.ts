import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'random-facts', endpoint: '/api/tools/random-facts', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 10)

    const facts: string[] = []
    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch('https://uselessfacts.jsph.pl/api/v2/facts/random')
        if (response.ok) {
          const data = await response.json()
          facts.push(data.text || '')
        }
      } catch {}
    }

    if (facts.length === 0) {
      const fallbackFacts = [
        'Honey never spoils. Archaeologists found 3000-year-old honey in Egyptian tombs that was still edible.',
        'Octopuses have three hearts and blue blood.',
        'The Eiffel Tower can be 15 cm taller during summer due to thermal expansion.',
        'A group of flamingos is called a flamboyance.',
        'Bananas are berries, but strawberries are not.',
        'The shortest war in history lasted only 38 to 45 minutes between Britain and Zanzibar.',
        'A day on Venus is longer than a year on Venus.',
        'Cows have best friends and get stressed when separated.'
      ]
      for (let i = 0; i < count; i++) {
        facts.push(fallbackFacts[i % fallbackFacts.length])
      }
    }

    return { count: facts.length, facts }
  }
)
