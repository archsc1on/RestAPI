import { createPlugin } from '@/lib/plugin'

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
        let url = `https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=5&addRecipeInformation=true&apiKey=${apiKey}`
        if (diet) url += `&diet=${diet}`
        if (cuisine) url += `&cuisine=${cuisine}`

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          const results = (data.results || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            image: r.image || '',
            readyInMinutes: r.readyInMinutes || 0,
            servings: r.servings || 0,
            healthScore: r.healthScore || 0,
            summary: (r.summary || '').replace(/<[^>]+>/g, '').substring(0, 200),
            sourceUrl: r.sourceUrl || '',
            cuisines: r.cuisines || [],
            diets: r.diets || []
          }))
          return { query, total: results.length, results }
        }
      } catch {}
    }

    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`
    )
    if (!response.ok) throw new Error('Search failed')

    const data = await response.json()
    const results = (data.meals || []).slice(0, 5).map((m: any) => ({
      id: m.idMeal,
      title: m.strMeal,
      image: m.strMealThumb || '',
      category: m.strCategory || '',
      area: m.strArea || '',
      instructions: (m.strInstructions || '').substring(0, 200),
      sourceUrl: m.strSource || '',
      youtubeUrl: m.strYoutube || ''
    }))

    return { query, total: results.length, results, source: 'ThemealDB' }
  }
)
