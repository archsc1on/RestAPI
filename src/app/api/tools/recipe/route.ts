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

const BUILTIN_RECIPES: Record<string, any> = {
  pasta: { id: 'builtin-1', title: 'Classic Spaghetti Aglio e Olio', image: '', category: 'Pasta', area: 'Italian', instructions: 'Cook spaghetti. Sauté garlic in olive oil with chili flakes. Toss pasta with garlic oil and parsley.', sourceUrl: '', youtubeUrl: '' },
  chicken: { id: 'builtin-2', title: 'Simple Grilled Chicken', image: '', category: 'Chicken', area: 'American', instructions: 'Season chicken breasts with salt, pepper, and herbs. Grill until cooked through, about 6-7 minutes per side.', sourceUrl: '', youtubeUrl: '' },
  salad: { id: 'builtin-3', title: 'Fresh Garden Salad', image: '', category: 'Side', area: 'American', instructions: 'Toss mixed greens, tomatoes, cucumbers, and carrots. Dress with olive oil and vinegar.', sourceUrl: '', youtubeUrl: '' },
  soup: { id: 'builtin-4', title: 'Hearty Tomato Soup', image: '', category: 'Soup', area: 'American', instructions: 'Simmer tomatoes with onion and garlic. Blend until smooth. Add cream and season to taste.', sourceUrl: '', youtubeUrl: '' }
}

export const GET = createPlugin(
  { name: 'recipe', endpoint: '/api/tools/recipe', costCredits: 2 },
  async (req, { searchParams }) => {
    const query = searchParams.get('q')
    const diet = searchParams.get('diet') || ''
    const cuisine = searchParams.get('cuisine') || ''

    if (!query) throw new Error('q (query) parameter required')

    const apiKey = process.env.SPOONACULAR_API_KEY || ''

    if (apiKey) {
      try {
        const data = await fetchWithRetry(async () => {
          let url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=5&addRecipeInformation=true&apiKey=${apiKey}`
          if (diet) url += `&diet=${diet}`
          if (cuisine) url += `&cuisine=${cuisine}`
          const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
          if (!response.ok) throw new Error('Spoonacular failed')
          return response.json()
        })
        const results = (data.results || []).map((r: any) => ({
          id: r.id, title: r.title, image: r.image || '', readyInMinutes: r.readyInMinutes || 0,
          servings: r.servings || 0, healthScore: r.healthScore || 0,
          summary: (r.summary || '').replace(/<[^>]+>/g, '').substring(0, 200),
          sourceUrl: r.sourceUrl || '', cuisines: r.cuisines || [], diets: r.diets || []
        }))
        if (results.length > 0) return { query, total: results.length, results }
      } catch {}
    }

    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch(
          `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
          { signal: AbortSignal.timeout(10000) }
        )
        if (!response.ok) throw new Error('ThemealDB failed')
        return response.json()
      })
      const results = (data.meals || []).slice(0, 5).map((m: any) => ({
        id: m.idMeal, title: m.strMeal, image: m.strMealThumb || '',
        category: m.strCategory || '', area: m.strArea || '',
        instructions: (m.strInstructions || '').substring(0, 200),
        sourceUrl: m.strSource || '', youtubeUrl: m.strYoutube || ''
      }))
      if (results.length > 0) return { query, total: results.length, results, source: 'ThemealDB' }
    } catch {}

    const matchKey = Object.keys(BUILTIN_RECIPES).find(k => query.toLowerCase().includes(k))
    const recipe = BUILTIN_RECIPES[matchKey || '']
    if (recipe) return { query, total: 1, results: [{ ...recipe }], source: 'builtin', note: 'External APIs unavailable, using built-in recipe' }

    return { query, total: 0, results: [], note: 'External APIs unavailable and no matching built-in recipe found' }
  }
)
