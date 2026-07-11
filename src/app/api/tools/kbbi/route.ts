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

const KBBI_URLS = [
  'https://kbbi.kemdikdasmen.go.id/entri',
  'https://kbbi.kemdikbud.go.id/kata'
]

export const GET = createPlugin(
  { name: 'kbbi', endpoint: '/api/tools/kbbi', costCredits: 1 },
  async (req, { searchParams }) => {
    const word = searchParams.get('word')
    if (!word) throw new Error('word parameter required')

    for (const baseUrl of KBBI_URLS) {
      try {
        const html = await fetchWithRetry(async () => {
          const response = await fetch(`${baseUrl}/${encodeURIComponent(word)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
            signal: AbortSignal.timeout(10000)
          })
          if (!response.ok) throw new Error('KBBI request failed')
          return response.text()
        })

        const entries: string[] = []
        const liRegex = /<li[^>]*class="[^"]*"[^>]*>([\s\S]*?)<\/li>/gi
        let match
        while ((match = liRegex.exec(html)) !== null) {
          const cleaned = match[1].replace(/<[^>]+>/g, '').trim()
          if (cleaned && cleaned.length > 2) entries.push(cleaned)
        }

        if (entries.length > 0) {
          return { word, source: 'KBBI', definitions: entries.slice(0, 5) }
        }
      } catch {}
    }

    return {
      word,
      definitions: [],
      note: `KBBI API is currently unreachable. You can try looking up "${word}" manually at https://kbbi.kemdikbud.go.id`
    }
  }
)
