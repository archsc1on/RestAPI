import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'kbbi', endpoint: '/api/tools/kbbi', costCredits: 1 },
  async (req, { searchParams }) => {
    const word = searchParams.get('word')
    if (!word) throw new Error('word parameter required')

    try {
      const response = await fetch(`https://kbbi.kemdikbud.go.id/kani/${encodeURIComponent(word)}`, {
        headers: { 'User-Agent': 'Mozilla/5.0' }
      })
      if (response.ok) {
        const html = await response.text()
        const entries: string[] = []

        const liRegex = /<li[^>]*class="[^"]*"[^>]*>([\s\S]*?)<\/li>/gi
        let match
        while ((match = liRegex.exec(html)) !== null) {
          const cleaned = match[1].replace(/<[^>]+>/g, '').trim()
          if (cleaned && cleaned.length > 2) entries.push(cleaned)
        }

        if (entries.length > 0) {
          return {
            word,
            source: 'KBBI',
            definitions: entries.slice(0, 5)
          }
        }
      }
    } catch {}

    throw new Error(`Definition for "${word}" not found in KBBI`)
  }
)
