'use client'

import { useState, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'
import {
  Search, ChevronRight, Copy, Check,
  MessageSquare, Film, Music, Camera,
  Zap, Info, Code, LogOut
} from 'lucide-react'

interface ApiDoc {
  name: string
  description: string
  method: 'GET' | 'POST'
  endpoint: string
  category: string
  tags: string[]
  cost: number
  params: { name: string; type: string; required: boolean; description: string }[]
  body?: { name: string; type: string; required: boolean; description: string }[]
  response: string
  example: { request: string; response: string }
}

const allDocs: ApiDoc[] = [
  {
    name: 'Send Message', description: 'Send message via WhatsApp, Telegram, or Discord',
    method: 'POST', endpoint: '/api/send', category: 'SEND', tags: ['send', 'message', 'wa', 'tg'], cost: 1,
    params: [{ name: 'x-api-key', type: 'header', required: true, description: 'Your API key' }],
    body: [
      { name: 'platform', type: 'string', required: true, description: 'whatsapp | telegram | discord' },
      { name: 'message', type: 'string', required: true, description: 'Message content' },
      { name: 'phoneNumber', type: 'string', required: false, description: 'Phone (WhatsApp)' },
      { name: 'chatId', type: 'string', required: false, description: 'Chat ID (Telegram)' },
      { name: 'channelId', type: 'string', required: false, description: 'Channel ID (Discord)' }
    ],
    response: 'JSON with status, message, remaining credits',
    example: {
      request: `POST /api/send\nx-api-key: sk_xxx\n\n{"platform":"whatsapp","phoneNumber":"62812","message":"Hello"}`,
      response: '{"status":true,"data":{"platform":"whatsapp","costCredits":1,"remaining":99}}'
    }
  },
  {
    name: 'IP Lookup', description: 'Lookup geolocation info for an IP address',
    method: 'GET', endpoint: '/api/tools/ip-lookup', category: 'TOOLS', tags: ['ip', 'location', 'geo'], cost: 1,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'ip', type: 'query', required: false, description: 'IP address (empty = your IP)' }
    ],
    response: 'JSON with IP geolocation data',
    example: { request: 'GET /api/tools/ip-lookup?ip=8.8.8.8\nx-api-key: sk_xxx', response: '{"status":true,"data":{"ip":"8.8.8.8","city":"Mountain View","country":"US"}}' }
  },
  {
    name: 'YouTube Search', description: 'Search YouTube videos by keyword',
    method: 'GET', endpoint: '/api/tools/yt-search', category: 'TOOLS', tags: ['youtube', 'yt', 'video'], cost: 2,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'q', type: 'query', required: true, description: 'Search query' },
      { name: 'limit', type: 'query', required: false, description: 'Max results (default 10)' }
    ],
    response: 'JSON with video search results',
    example: { request: 'GET /api/tools/yt-search?q=nodejs&limit=5\nx-api-key: sk_xxx', response: '{"status":true,"data":{"results":[{"id":"xxx","title":"Node.js Tutorial"}]}}' }
  },
  {
    name: 'Text to Speech', description: 'Convert text to speech audio',
    method: 'GET', endpoint: '/api/tools/tts', category: 'TOOLS', tags: ['tts', 'audio', 'voice'], cost: 1,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'text', type: 'query', required: true, description: 'Text to convert (max 2000 chars)' },
      { name: 'lang', type: 'query', required: false, description: 'Language code (default: id)' }
    ],
    response: 'JSON with audio URL',
    example: { request: 'GET /api/tools/tts?text=Halo&lang=id\nx-api-key: sk_xxx', response: '{"status":true,"data":{"audio":"https://..."}}' }
  },
  {
    name: 'QR Code', description: 'Generate QR code from any text or URL',
    method: 'GET', endpoint: '/api/tools/qrcode', category: 'TOOLS', tags: ['qr', 'qrcode', 'barcode'], cost: 1,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'text', type: 'query', required: true, description: 'Text or URL to encode' },
      { name: 'size', type: 'query', required: false, description: 'Size in pixels (default: 300)' }
    ],
    response: 'JSON with QR code image URL',
    example: { request: 'GET /api/tools/qrcode?text=https://google.com\nx-api-key: sk_xxx', response: '{"status":true,"data":{"qr":"https://api.qrserver.com/..."}}' }
  },
  {
    name: 'URL Shortener', description: 'Shorten any URL',
    method: 'GET', endpoint: '/api/tools/shorturl', category: 'TOOLS', tags: ['short', 'url', 'link'], cost: 1,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'url', type: 'query', required: true, description: 'URL to shorten' }
    ],
    response: 'JSON with shortened URL',
    example: { request: 'GET /api/tools/shorturl?url=https://google.com\nx-api-key: sk_xxx', response: '{"status":true,"data":{"short":"https://cleanuri.com/..."}}' }
  },
  {
    name: 'Weather', description: 'Get current weather for any city',
    method: 'GET', endpoint: '/api/tools/weather', category: 'TOOLS', tags: ['weather', 'cuaca'], cost: 1,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'city', type: 'query', required: true, description: 'City name' }
    ],
    response: 'JSON with weather data',
    example: { request: 'GET /api/tools/weather?city=Jakarta\nx-api-key: sk_xxx', response: '{"status":true,"data":{"city":"Jakarta","temperature":{"celsius":"30"}}}' }
  },
  {
    name: 'GitHub Profile', description: 'Get GitHub user profile information',
    method: 'GET', endpoint: '/api/tools/github', category: 'TOOLS', tags: ['github', 'git', 'profile'], cost: 1,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'user', type: 'query', required: true, description: 'GitHub username' }
    ],
    response: 'JSON with GitHub profile data',
    example: { request: 'GET /api/tools/github?user=torvalds\nx-api-key: sk_xxx', response: '{"status":true,"data":{"username":"torvalds","repos":7}}' }
  },
  {
    name: 'Translate', description: 'Translate text to any language',
    method: 'GET', endpoint: '/api/tools/translate', category: 'TOOLS', tags: ['translate', 'bahasa'], cost: 1,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'text', type: 'query', required: true, description: 'Text to translate (max 5000)' },
      { name: 'to', type: 'query', required: false, description: 'Target language (default: en)' },
      { name: 'from', type: 'query', required: false, description: 'Source language (default: auto)' }
    ],
    response: 'JSON with translated text',
    example: { request: 'GET /api/tools/translate?text=Halo&to=en\nx-api-key: sk_xxx', response: '{"status":true,"data":{"translated":"Hello"}}' }
  },
  {
    name: 'Anime Search', description: 'Search anime from MyAnimeList',
    method: 'GET', endpoint: '/api/tools/anime', category: 'ANIME', tags: ['anime', 'manga', 'mal'], cost: 2,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'q', type: 'query', required: true, description: 'Anime title to search' }
    ],
    response: 'JSON with anime search results',
    example: { request: 'GET /api/tools/anime?q=naruto\nx-api-key: sk_xxx', response: '{"status":true,"data":{"results":[{"title":"Naruto","score":"8.03"}]}}' }
  },
  {
    name: 'Lyrics', description: 'Search song lyrics',
    method: 'GET', endpoint: '/api/tools/lyrics', category: 'MEDIA', tags: ['lyrics', 'lirik', 'song'], cost: 1,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'q', type: 'query', required: true, description: 'Song title to search' }
    ],
    response: 'JSON with lyrics',
    example: { request: 'GET /api/tools/lyrics?q=shape+of+you\nx-api-key: sk_xxx', response: '{"status":true,"data":{"title":"Shape of You","lyrics":"..."}}' }
  },
  {
    name: 'Spotify Info', description: 'Get Spotify track/album info',
    method: 'GET', endpoint: '/api/tools/spotify', category: 'MEDIA', tags: ['spotify', 'music'], cost: 1,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'url', type: 'query', required: true, description: 'Spotify URL' }
    ],
    response: 'JSON with Spotify track info',
    example: { request: 'GET /api/tools/spotify?url=https://open.spotify.com/track/xxx\nx-api-key: sk_xxx', response: '{"status":true,"data":{"title":"Shape of You"}}' }
  },
  {
    name: 'Instagram Info', description: 'Get Instagram post information',
    method: 'GET', endpoint: '/api/tools/ig', category: 'SOCIAL', tags: ['instagram', 'ig'], cost: 2,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'url', type: 'query', required: true, description: 'Instagram post URL' }
    ],
    response: 'JSON with Instagram post info',
    example: { request: 'GET /api/tools/ig?url=https://instagram.com/p/xxx\nx-api-key: sk_xxx', response: '{"status":true,"data":{"username":"user"}}' }
  },
  {
    name: 'TikTok Info', description: 'Get TikTok video information',
    method: 'GET', endpoint: '/api/tools/tiktok', category: 'SOCIAL', tags: ['tiktok', 'tt'], cost: 2,
    params: [
      { name: 'x-api-key', type: 'header', required: true, description: 'Your API key' },
      { name: 'url', type: 'query', required: true, description: 'TikTok video URL' }
    ],
    response: 'JSON with TikTok video info',
    example: { request: 'GET /api/tools/tiktok?url=https://tiktok.com/@user/video/xxx\nx-api-key: sk_xxx', response: '{"status":true,"data":{"author":{"username":"user"}}}' }
  }
]

const categoryIcons: Record<string, any> = { SEND: MessageSquare, TOOLS: Zap, ANIME: Film, MEDIA: Music, SOCIAL: Camera }
const categories = [
  { name: 'SEMUA', count: allDocs.length },
  { name: 'SEND', count: allDocs.filter(d => d.category === 'SEND').length },
  { name: 'TOOLS', count: allDocs.filter(d => d.category === 'TOOLS').length },
  { name: 'ANIME', count: allDocs.filter(d => d.category === 'ANIME').length },
  { name: 'MEDIA', count: allDocs.filter(d => d.category === 'MEDIA').length },
  { name: 'SOCIAL', count: allDocs.filter(d => d.category === 'SOCIAL').length }
]

export default function DocsPage() {
  const { data: session } = useSession()
  const [selected, setSelected] = useState<string>('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('SEMUA')
  const [copied, setCopied] = useState(false)
  const [activeTab, setActiveTab] = useState<'info' | 'code'>('info')

  const filteredDocs = useMemo(() => {
    return allDocs.filter(doc => {
      const matchCat = activeCategory === 'SEMUA' || doc.category === activeCategory
      const matchSearch = !searchQuery ||
        doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(t => t.includes(searchQuery.toLowerCase()))
      return matchCat && matchSearch
    })
  }, [activeCategory, searchQuery])

  const selectedDoc = allDocs.find(d => d.name === selected)

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation - same as dashboard */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
            API Docs
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-orange-400 transition">Home</a>
            <a href="/dashboard" className="hover:text-orange-400 transition">Dashboard</a>
            <a href="/pricing" className="hover:text-orange-400 transition">Pricing</a>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-600">
              <div className="text-right">
                <div className="text-sm font-medium">{session?.user?.name || session?.user?.email}</div>
                <div className="text-xs text-slate-400">Docs</div>
              </div>
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 hover:bg-slate-700 rounded transition" title="Sign out">
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="flex items-center gap-4 mb-6 text-sm">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-500 rounded-full" /> {allDocs.length} Endpoints</span>
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-green-500 rounded-full" /> Free tier available</span>
          <span className="ml-auto text-slate-400">Base URL: <code className="text-orange-400">http://localhost:3000</code></span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Endpoint List */}
          <div className="lg:col-span-1">
            {/* Search */}
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
                <Search size={16} className="text-slate-500" />
                <input
                  type="text" placeholder="Cari endpoint..."
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm flex-1 outline-none placeholder-slate-500"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button key={cat.name} onClick={() => setActiveCategory(cat.name)}
                  className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${
                    activeCategory === cat.name ? 'bg-orange-500 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600'
                  }`}>
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            {/* Endpoint cards */}
            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {filteredDocs.map((doc) => (
                <motion.button key={doc.name} whileHover={{ scale: 1.01 }}
                  onClick={() => { setSelected(doc.name); setActiveTab('info') }}
                  className={`w-full text-left p-4 rounded-lg border transition ${
                    selected === doc.name
                      ? 'bg-orange-500/10 border-orange-500/50'
                      : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'
                  }`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      doc.method === 'GET' ? 'bg-blue-600' : 'bg-purple-600'
                    }`}>{doc.method}</span>
                    <span className="text-xs text-slate-500">{doc.category}</span>
                    <span className="ml-auto text-xs text-orange-400 font-bold">{doc.cost}cr</span>
                  </div>
                  <div className="text-sm font-bold mb-0.5">{doc.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{doc.endpoint}</div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Right Panel - Detail */}
          <div className="lg:col-span-2">
            {selectedDoc ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                className="bg-slate-800/30 border border-slate-600 rounded-xl p-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <span>TOOLS</span>
                  <ChevronRight size={12} />
                  <span className="text-white">{selectedDoc.name.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    selectedDoc.method === 'GET' ? 'bg-blue-600' : 'bg-purple-600'
                  }`}>{selectedDoc.method}</span>
                  <span className="text-xs text-slate-500">v1.0.0</span>
                </div>

                <h1 className="text-2xl font-bold mb-2">{selectedDoc.name}</h1>
                <p className="text-slate-400 mb-6 text-sm">{selectedDoc.description}</p>

                {/* URL Box */}
                <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-3 mb-6 border border-slate-700">
                  <span className={`text-xs font-bold ${selectedDoc.method === 'GET' ? 'text-blue-400' : 'text-purple-400'}`}>
                    {selectedDoc.method}
                  </span>
                  <code className="text-sm text-orange-400 flex-1 font-mono">
                    http://localhost:3000{selectedDoc.endpoint}
                  </code>
                  <button onClick={() => copyText(`http://localhost:3000${selectedDoc.endpoint}`)}
                    className="px-3 py-1 bg-slate-700 rounded text-xs hover:bg-slate-600 transition flex items-center gap-1">
                    {copied ? <Check size={12} className="text-green-400" /> : <Copy size={12} />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-slate-700 mb-6">
                  {[{ id: 'info' as const, label: 'Info', icon: Info }, { id: 'code' as const, label: 'Code', icon: Code }].map((tab) => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                      className={`pb-3 text-sm font-medium flex items-center gap-2 transition border-b-2 ${
                        activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-white'
                      }`}>
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'info' && (
                  <>
                    {/* Config Cards */}
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {[
                        { label: 'AUTH', value: 'API Key', color: 'text-orange-400' },
                        { label: 'TIER', value: 'Free', color: 'text-green-400' },
                        { label: 'BIAYA', value: `${selectedDoc.cost} Credit`, color: 'text-orange-400' },
                        { label: 'TIMEOUT', value: '3s', color: 'text-white' }
                      ].map((item) => (
                        <div key={item.label} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                          <div className="text-[10px] text-slate-500 mb-1">{item.label}</div>
                          <div className={`text-sm font-bold ${item.color}`}>{item.value}</div>
                        </div>
                      ))}
                    </div>

                    {/* Tags */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold mb-2">Tags</h3>
                      <div className="flex gap-2">
                        {selectedDoc.tags.map((tag) => (
                          <span key={tag} className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-400">#{tag}</span>
                        ))}
                      </div>
                    </div>

                    {/* Parameters Table */}
                    <div className="mb-6">
                      <h3 className="text-sm font-bold mb-3">Parameter</h3>
                      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-slate-700">
                            <th className="text-left px-4 py-2 text-xs text-slate-500">NAMA</th>
                            <th className="text-left px-4 py-2 text-xs text-slate-500">TYPE</th>
                            <th className="text-left px-4 py-2 text-xs text-slate-500">WAJIB</th>
                            <th className="text-left px-4 py-2 text-xs text-slate-500">DESKRIPSI</th>
                          </tr></thead>
                          <tbody>
                            {selectedDoc.params.map((p, i) => (
                              <tr key={i} className="border-b border-slate-700/50 last:border-0">
                                <td className="px-4 py-2 text-orange-400 font-mono text-xs">{p.name}</td>
                                <td className="px-4 py-2"><span className="px-2 py-0.5 bg-slate-700 rounded text-xs">{p.type}</span></td>
                                <td className="px-4 py-2">{p.required
                                  ? <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Wajib</span>
                                  : <span className="text-xs text-slate-500">Opsional</span>}</td>
                                <td className="px-4 py-2 text-slate-400 text-xs">{p.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Body Table */}
                    {selectedDoc.body && selectedDoc.body.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold mb-3">Request Body</h3>
                        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead><tr className="border-b border-slate-700">
                              <th className="text-left px-4 py-2 text-xs text-slate-500">NAMA</th>
                              <th className="text-left px-4 py-2 text-xs text-slate-500">TYPE</th>
                              <th className="text-left px-4 py-2 text-xs text-slate-500">WAJIB</th>
                              <th className="text-left px-4 py-2 text-xs text-slate-500">DESKRIPSI</th>
                            </tr></thead>
                            <tbody>
                              {selectedDoc.body.map((f, i) => (
                                <tr key={i} className="border-b border-slate-700/50 last:border-0">
                                  <td className="px-4 py-2 text-orange-400 font-mono text-xs">{f.name}</td>
                                  <td className="px-4 py-2"><span className="px-2 py-0.5 bg-slate-700 rounded text-xs">{f.type}</span></td>
                                  <td className="px-4 py-2">{f.required
                                    ? <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Wajib</span>
                                    : <span className="text-xs text-slate-500">Opsional</span>}</td>
                                  <td className="px-4 py-2 text-slate-400 text-xs">{f.description}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {activeTab === 'code' && (
                  <>
                    <div className="mb-6">
                      <h3 className="text-sm font-bold mb-3">Contoh Request</h3>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-sm">
                        <pre className="whitespace-pre-wrap text-slate-300">{selectedDoc.example.request}</pre>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-bold mb-3">Contoh Response</h3>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-sm">
                        <pre className="text-green-400">{selectedDoc.example.response}</pre>
                      </div>
                    </div>
                  </>
                )}
              </motion.div>
            ) : (
              <div className="bg-slate-800/30 border border-slate-600 rounded-xl p-12 text-center text-slate-500">
                <Zap size={48} className="mx-auto mb-4 text-slate-600" />
                <p>Select an endpoint from the list</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
