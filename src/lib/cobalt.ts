const COBALT_API = process.env.COBALT_API_URL || 'https://cobalt.dzakii.my.id'
const COBALT_KEY = process.env.COBALT_API_KEY || ''

interface CobaltRequest {
  url: string
  downloadMode?: 'auto' | 'audio' | 'mute'
  videoQuality?: string
  audioBitrate?: string
  audioFormat?: string
  filenameStyle?: string
  disableMetadata?: boolean
}

interface CobaltResponse {
  status: 'tunnel' | 'redirect' | 'picker' | 'error' | 'local-processing'
  url?: string
  filename?: string
  audio?: string
  audioFilename?: string
  picker?: Array<{ type: string; url: string; thumb?: string }>
  error?: { code: string; context?: any }
  type?: string
  tunnel?: string[]
  output?: { type: string; filename: string }
}

export async function cobaltDownload(options: CobaltRequest): Promise<CobaltResponse> {
  const body: Record<string, any> = {
    url: options.url,
    downloadMode: options.downloadMode || 'auto',
    videoQuality: options.videoQuality || '1080',
    audioBitrate: options.audioBitrate || '128',
    audioFormat: options.audioFormat || 'mp3',
    filenameStyle: options.filenameStyle || 'basic',
    disableMetadata: options.disableMetadata || false,
  }

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  }
  if (COBALT_KEY) {
    headers['Authorization'] = COBALT_KEY
  }

  const res = await fetch(COBALT_API, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(30000),
  })

  if (!res.ok) {
    throw new Error(`Cobalt API error: ${res.status}`)
  }

  return res.json()
}

export function isSupportedUrl(url: string): boolean {
  const supported = [
    'youtube.com', 'youtu.be',
    'tiktok.com',
    'instagram.com',
    'twitter.com', 'x.com',
    'facebook.com', 'fb.watch',
    'reddit.com', 'redd.it',
    'soundcloud.com',
    'twitch.tv',
    'vimeo.com',
    'dailymotion.com',
    'bilibili.com',
    'pinterest.com',
    'streamable.com',
    'bsky.app',
    'loom.com',
    'ok.ru',
    'newgrounds.com',
    'rutube.ru',
    'snapchat.com',
    'tumblr.com',
    'vk.com',
  ]
  return supported.some((d) => url.includes(d))
}
