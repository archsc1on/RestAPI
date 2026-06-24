export interface CobaltRequest {
  url: string
  downloadMode?: 'auto' | 'audio' | 'mute'
  audioFormat?: 'mp3' | 'best'
  videoQuality?: '360' | '480' | '720' | '1080' | '1440' | '2160'
}

export async function cobaltDownload(opts: CobaltRequest): Promise<{ downloadUrl: string }> {
  const body = {
    url: opts.url,
    downloadMode: opts.downloadMode || 'auto',
    audioFormat: opts.audioFormat || 'mp3',
    videoQuality: opts.videoQuality || '720',
    filenameStyle: 'pretty'
  }

  const res = await fetch('https://api.cobalt.tools/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000)
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Cobalt API returned ${res.status}: ${text.substring(0, 200)}`)
  }

  const data = await res.json()

  if (data.url) {
    return { downloadUrl: data.url }
  }

  if (data.status === 'error') {
    const code = data.error?.code || data.error || 'unknown'
    throw new Error(`Download failed: ${code}`)
  }

  if (data.status === 'tunnel' || data.status === 'redirect') {
    return { downloadUrl: data.url }
  }

  throw new Error('No download URL in response')
}

export function validateUrl(url: string, allowedDomains: string[]): boolean {
  try {
    const parsed = new URL(url)
    return allowedDomains.some(d => parsed.hostname.includes(d))
  } catch {
    return false
  }
}

export function extractVideoId(url: string, patterns: RegExp[]): string {
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match?.[1]) return match[1]
  }
  return ''
}
