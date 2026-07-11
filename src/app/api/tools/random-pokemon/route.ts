import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'random-pokemon', endpoint: '/api/tools/random-pokemon', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(Math.max(parseInt(searchParams.get('count') || '1'), 1), 10)

    const results: any[] = []
    for (let i = 0; i < count; i++) {
      const id = Math.floor(Math.random() * 1010) + 1
      try {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`, {
          signal: AbortSignal.timeout(5000)
        })
        if (response.ok) {
          const data = await response.json()
          results.push({
            id: data.id,
            name: data.name,
            types: data.types.map((t: any) => t.type.name),
            height: data.height / 10,
            weight: data.weight / 10,
            sprite: data.sprites?.front_default,
            stats: data.stats.map((s: any) => ({
              name: s.stat.name,
              value: s.base_stat
            }))
          })
        }
      } catch {}
    }

    if (results.length === 0) throw new Error('Failed to fetch pokemon')

    return { count: results.length, pokemon: results }
  }
)
