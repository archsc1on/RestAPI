const KITSU_API = 'https://kitsu.io/api/edge'

export interface KitsuResponse<T> {
  data: T[]
  meta?: { count: number }
  links?: { next?: string; last?: string }
}

export interface KitsuAnime {
  id: string
  type: string
  attributes: {
    slug: string
    canonicalTitle: string
    titles: Record<string, string>
    synopsis: string
    status: string
    episodeCount: number | null
    episodesCount: number | null
    startDate: string
    endDate: string | null
    season: string
    ratingRank: number
    popularityRank: number
    posterImage: { original: string; large: string; medium: string; small: string; tiny: string }
    coverImage: { original: string; large: string; small: string } | null
    nsfw: boolean
  }
}

export interface KitsuManga {
  id: string
  type: string
  attributes: {
    slug: string
    canonicalTitle: string
    titles: Record<string, string>
    synopsis: string
    status: string
    chapterCount: number | null
    volumeCount: number | null
    startDate: string
    endDate: string | null
    ratingRank: number
    popularityRank: number
    posterImage: { original: string; large: string; medium: string; small: string; tiny: string }
    coverImage: { original: string; large: string; small: string } | null
    nsfw: boolean
  }
}

export interface KitsuCharacter {
  id: string
  type: string
  attributes: {
    name: string
    names: Record<string, string>
    canonicalName: string
    description: string
    image: { original: string; large: string; medium: string; small: string; tiny: string } | null
  }
}

export interface KitsuCategory {
  id: string
  type: string
  attributes: {
    name: string
    slug: string
    description: string | null
  }
}

export interface KitsuEpisode {
  id: string
  type: string
  attributes: {
    number: number
    titles: Record<string, string>
    canonicalTitle: string
    synopsis: string
    airedAt: string
    length: number | null
  }
}

export async function kitsuFetch<T>(url: string, retries = 2, timeoutMs = 8000): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
        },
        signal: controller.signal,
      })
      clearTimeout(timer)

      if (!res.ok) throw new Error(`Kitsu API returned ${res.status}`)
      return await res.json() as T
    } catch (err: any) {
      clearTimeout(timer)
      lastError = err

      if (attempt < retries) {
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, attempt)))
      }
    }
  }

  throw lastError ?? new Error('Kitsu fetch failed')
}

export function getKitsuUrl(path: string, params?: Record<string, string>): string {
  const base = KITSU_API + path
  const url = new URL(base)
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      url.searchParams.set(k, v)
    }
  }
  return url.toString()
}
