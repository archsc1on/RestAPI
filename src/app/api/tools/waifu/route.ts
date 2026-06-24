import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'waifu', endpoint: '/api/tools/waifu', costCredits: 1 },
  async (req, { searchParams }) => {
    const category = searchParams.get('category') || 'neko'
    const type = searchParams.get('type') || 'sfw'

    const validCategories = ['waifu', 'neko', 'shinobu', 'megumin', 'bully', 'cuddle', 'cry', 'hug', 'awoo', 'kiss', 'lick', 'pat', 'smug', 'bonk', 'yeet', 'blush', 'smile', 'wave', 'highfive', 'handhold', 'nom', 'bite', 'glomp', 'slap', 'kill', 'kick', 'happy', 'wink', 'poke', 'dance', 'cringe']
    const cat = validCategories.includes(category) ? category : 'neko'

    const response = await fetch(`https://api.waifu.pics/${type}/${cat}`)
    if (!response.ok) throw new Error('Failed to fetch image')

    const data = await response.json()
    return {
      category: cat,
      type,
      url: data.url,
      format: data.url?.split('.').pop() || 'jpg'
    }
  }
)
