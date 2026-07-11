'use client'

import { useState, useMemo } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { motion } from 'framer-motion'

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
import { Search, ChevronRight, Copy, Check, Zap, Info, Code, LogOut } from 'lucide-react'
import { endpoints, categoryColors, type ApiEndpoint } from '@/lib/api-registry'
import toast from 'react-hot-toast'

const categories = [
  { name: 'SEMUA', count: endpoints.length },
  ...Object.keys(categoryColors).map(name => ({
    name,
    count: endpoints.filter(d => d.category === name).length
  })).filter(c => c.count > 0)
]

export default function DocsPage() {
  const { data: session } = useSession()
  const [selected, setSelected] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('SEMUA')
  const [activeTab, setActiveTab] = useState<'info' | 'code'>('info')

  const filtered = useMemo(() => endpoints.filter(doc => {
    const matchCat = activeCategory === 'SEMUA' || doc.category === activeCategory
    const matchSearch = !searchQuery || doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || doc.endpoint.toLowerCase().includes(searchQuery.toLowerCase()) || doc.tags.some(t => t.includes(searchQuery.toLowerCase()))
    return matchCat && matchSearch
  }), [activeCategory, searchQuery])

  const doc = endpoints.find(d => d.name === selected)

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
    }
    toast.success('Copied!', { duration: 1500 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">API Docs</div>
          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-orange-400 transition">Home</a>
            <a href="/dashboard" className="hover:text-orange-400 transition">Dashboard</a>
            <a href="/pricing" className="hover:text-orange-400 transition">Pricing</a>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-600">
              <div className="text-right">
                <div className="text-sm font-medium">{session?.user?.name || session?.user?.email}</div>
                <div className="text-xs text-slate-400">Docs</div>
              </div>
              <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 hover:bg-slate-700 rounded transition"><LogOut size={18} /></button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6 text-sm">
          <span className="flex items-center gap-1.5"><span className="w-2 h-2 bg-orange-500 rounded-full" /> {endpoints.length} Endpoints</span>
          <span className="ml-auto text-slate-400">Base: <code className="text-orange-400">{API_BASE}</code></span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="flex items-center gap-2 bg-slate-800/50 border border-slate-600 rounded-lg px-3 py-2">
                <Search size={16} className="text-slate-500" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-sm flex-1 outline-none placeholder-slate-500" />
              </div>
            </div>

            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {categories.map(cat => (
                <button key={cat.name} onClick={() => setActiveCategory(cat.name)} className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition ${activeCategory === cat.name ? 'bg-orange-500 text-white' : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600'}`}>
                  {cat.name} ({cat.count})
                </button>
              ))}
            </div>

            <div className="space-y-2 max-h-[65vh] overflow-y-auto pr-1">
              {filtered.map(d => (
                <motion.button key={d.name} whileHover={{ scale: 1.01 }} onClick={() => { setSelected(d.name); setActiveTab('info') }}
                  className={`w-full text-left p-3 rounded-lg border transition ${selected === d.name ? 'bg-orange-500/10 border-orange-500/50' : 'bg-slate-800/30 border-slate-700 hover:border-slate-500'}`}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${d.method === 'GET' ? 'bg-blue-600' : 'bg-purple-600'}`}>{d.method}</span>
                    <span className="text-xs text-slate-500">{d.category}</span>
                    <span className="ml-auto text-xs text-orange-400 font-bold">{d.cost}cr</span>
                  </div>
                  <div className="text-sm font-bold mb-0.5">{d.name}</div>
                  <div className="text-xs text-slate-500 font-mono">{d.endpoint}</div>
                </motion.button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            {doc ? (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-slate-800/30 border border-slate-600 rounded-xl p-6">
                <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
                  <span>{doc.category}</span><ChevronRight size={12} /><span className="text-white">{doc.name.toUpperCase()}</span>
                </div>

                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${doc.method === 'GET' ? 'bg-blue-600' : 'bg-purple-600'}`}>{doc.method}</span>
                </div>
                <h1 className="text-2xl font-bold mb-2">{doc.name}</h1>
                <p className="text-slate-400 mb-6 text-sm">{doc.description}</p>

                <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-3 mb-6 border border-slate-700">
                  <span className={`text-xs font-bold ${doc.method === 'GET' ? 'text-blue-400' : 'text-purple-400'}`}>{doc.method}</span>
                  <code className="text-sm text-orange-400 flex-1 font-mono">{API_BASE}{doc.endpoint}</code>
                  <button onClick={() => copyText(`${API_BASE}${doc.endpoint}`)} className="px-3 py-1 bg-slate-700 rounded text-xs hover:bg-slate-600 transition flex items-center gap-1">
                    <Copy size={12} /> Copy
                  </button>
                </div>

                <div className="flex gap-6 border-b border-slate-700 mb-6">
                  {[{ id: 'info' as const, label: 'Info', icon: Info }, { id: 'code' as const, label: 'Code', icon: Code }].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`pb-3 text-sm font-medium flex items-center gap-2 transition border-b-2 ${activeTab === tab.id ? 'border-orange-500 text-orange-500' : 'border-transparent text-slate-400 hover:text-white'}`}>
                      <tab.icon size={14} /> {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'info' && (
                  <>
                    <div className="grid grid-cols-4 gap-3 mb-6">
                      {[{ l: 'AUTH', v: 'API Key', c: 'text-orange-400' }, { l: 'COST', v: `${doc.cost} Credit`, c: 'text-orange-400' }, { l: 'TIER', v: 'Free', c: 'text-green-400' }, { l: 'TIMEOUT', v: '3s', c: 'text-white' }].map(i => (
                        <div key={i.l} className="bg-slate-900 rounded-lg p-3 border border-slate-700">
                          <div className="text-[10px] text-slate-500 mb-1">{i.l}</div>
                          <div className={`text-sm font-bold ${i.c}`}>{i.v}</div>
                        </div>
                      ))}
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm font-bold mb-2">Tags</h3>
                      <div className="flex gap-2 flex-wrap">{doc.tags.map(t => <span key={t} className="px-3 py-1 bg-slate-700/50 rounded-full text-xs text-slate-400">#{t}</span>)}</div>
                    </div>

                    <div className="mb-6">
                      <h3 className="text-sm font-bold mb-3">Parameters</h3>
                      <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                        <table className="w-full text-sm">
                          <thead><tr className="border-b border-slate-700">
                            <th className="text-left px-4 py-2 text-xs text-slate-500">NAME</th>
                            <th className="text-left px-4 py-2 text-xs text-slate-500">TYPE</th>
                            <th className="text-left px-4 py-2 text-xs text-slate-500">REQUIRED</th>
                            <th className="text-left px-4 py-2 text-xs text-slate-500">DESC</th>
                          </tr></thead>
                          <tbody>
                            {doc.params.map((p, i) => (
                              <tr key={i} className="border-b border-slate-700/50 last:border-0">
                                <td className="px-4 py-2 text-orange-400 font-mono text-xs">{p.name}</td>
                                <td className="px-4 py-2"><span className="px-2 py-0.5 bg-slate-700 rounded text-xs">{p.type}</span></td>
                                <td className="px-4 py-2">{p.required ? <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Yes</span> : <span className="text-xs text-slate-500">No</span>}</td>
                                <td className="px-4 py-2 text-slate-400 text-xs">{p.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {doc.body && doc.body.length > 0 && (
                      <div className="mb-6">
                        <h3 className="text-sm font-bold mb-3">Request Body</h3>
                        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
                          <table className="w-full text-sm">
                            <thead><tr className="border-b border-slate-700">
                              <th className="text-left px-4 py-2 text-xs text-slate-500">NAME</th>
                              <th className="text-left px-4 py-2 text-xs text-slate-500">TYPE</th>
                              <th className="text-left px-4 py-2 text-xs text-slate-500">REQUIRED</th>
                              <th className="text-left px-4 py-2 text-xs text-slate-500">DESC</th>
                            </tr></thead>
                            <tbody>
                              {doc.body.map((f, i) => (
                                <tr key={i} className="border-b border-slate-700/50 last:border-0">
                                  <td className="px-4 py-2 text-orange-400 font-mono text-xs">{f.name}</td>
                                  <td className="px-4 py-2"><span className="px-2 py-0.5 bg-slate-700 rounded text-xs">{f.type}</span></td>
                                  <td className="px-4 py-2">{f.required ? <span className="px-2 py-0.5 bg-red-500/20 text-red-400 rounded text-xs">Yes</span> : <span className="text-xs text-slate-500">No</span>}</td>
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
                      <h3 className="text-sm font-bold mb-3">Request</h3>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-sm">
                        <pre className="whitespace-pre-wrap text-slate-300">{doc.example.request}</pre>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h3 className="text-sm font-bold mb-3">Response</h3>
                      <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 font-mono text-sm">
                        <pre className="text-green-400">{doc.example.response}</pre>
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
