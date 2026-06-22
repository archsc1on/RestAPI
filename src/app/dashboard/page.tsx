'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Copy, Trash2, Plus, Eye, EyeOff, LogOut, Zap, CreditCard, BarChart3, RefreshCw } from 'lucide-react'

interface ApiKey {
  id: string
  key: string
  name: string
  description?: string
  tier: string
  creditsDaily: number
  creditsUsed: number
  rateLimit: number
  totalRequests: number
  successRequests: number
  failedRequests: number
  isActive: boolean
  createdAt: string
}

interface UserData {
  credits: number
  tier: string
  creditsDaily: number
  creditsUsedToday: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [newKey, setNewKey] = useState({ name: '', description: '' })
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated') {
      loadApiKeys()
      loadUserData()

      // Auto-refresh setiap 5 detik
      const interval = setInterval(() => {
        loadApiKeys()
        loadUserData()
      }, 5000)

      return () => clearInterval(interval)
    }
  }, [status])

  const loadApiKeys = async () => {
    try {
      const res = await fetch('/api/user/keys')
      if (res.ok) {
        const data = await res.json()
        setKeys(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load keys:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadUserData = async () => {
    try {
      const res = await fetch('/api/user/credits')
      if (res.ok) {
        const data = await res.json()
        setUserData(data.data)
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
    }
  }

  const createKey = async () => {
    try {
      const res = await fetch('/api/user/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newKey)
      })
      const data = await res.json()
      if (data.status) {
        setKeys([...keys, data.data])
        setNewKey({ name: '', description: '' })
        setShowForm(false)
        loadUserData() // Refresh credits
      } else {
        alert(data.message || 'Failed to create key')
      }
    } catch (error) {
      console.error('Failed to create key:', error)
    }
  }

  const deleteKey = async (id: string) => {
    if (confirm('Delete this API key?')) {
      try {
        const res = await fetch(`/api/user/keys/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setKeys(keys.filter(k => k.id !== id))
        }
      } catch (error) {
        console.error('Failed to delete key:', error)
      }
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const toggleKeyVisibility = (id: string) => {
    const newSet = new Set(visibleKeys)
    if (newSet.has(id)) {
      newSet.delete(id)
    } else {
      newSet.add(id)
    }
    setVisibleKeys(newSet)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  const tierColors: Record<string, string> = {
    FREE: 'text-slate-300',
    PREMIUM: 'text-blue-400',
    VIP: 'text-purple-400'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Dashboard
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-blue-400 transition">Home</a>
            <a href="/docs" className="hover:text-blue-400 transition">Docs</a>
            <div className="flex items-center gap-3 pl-4 border-l border-slate-600">
              <div className="text-right">
                <div className="text-sm font-medium">{session?.user?.name || session?.user?.email}</div>
                <div className={`text-xs ${tierColors[userData?.tier || 'FREE']}`}>{userData?.tier || 'FREE'}</div>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: '/login' })}
                className="p-2 hover:bg-slate-700 rounded transition"
                title="Sign out"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Credit Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 bg-slate-700/50 rounded-lg border border-slate-600"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded">
                  <CreditCard size={20} className="text-blue-400" />
                </div>
                <span className="text-slate-400 text-sm">Credits Today</span>
              </div>
              <button
                onClick={() => { loadUserData(); loadApiKeys() }}
                className="p-1 hover:bg-slate-600 rounded transition"
                title="Refresh"
              >
                <RefreshCw size={14} className="text-slate-400" />
              </button>
            </div>
            <div className="text-3xl font-bold">{userData?.credits ?? '-'}</div>
            <div className="text-xs text-slate-500 mt-1">Resets daily at midnight</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-5 bg-slate-700/50 rounded-lg border border-slate-600"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-purple-600/20 rounded">
                <Zap size={20} className="text-purple-400" />
              </div>
              <span className="text-slate-400 text-sm">Plan</span>
            </div>
            <div className={`text-2xl font-bold ${tierColors[userData?.tier || 'FREE']}`}>
              {userData?.tier || 'FREE'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {userData?.tier === 'FREE' ? '1 key max' :
               userData?.tier === 'PREMIUM' ? '5 keys max' : '20 keys max'}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-5 bg-slate-700/50 rounded-lg border border-slate-600"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2 bg-green-600/20 rounded">
                <BarChart3 size={20} className="text-green-400" />
              </div>
              <span className="text-slate-400 text-sm">Usage</span>
            </div>
            <div className="text-3xl font-bold">
              {userData?.creditsUsedToday ?? 0}
              <span className="text-lg text-slate-400"> / {userData?.creditsDaily ?? 0}</span>
            </div>
            <div className="text-xs text-slate-500 mt-1">Credits used today</div>
          </motion.div>
        </div>

        {/* API Keys */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold">API Keys</h2>
            <p className="text-slate-400 text-sm">
              {keys.length} / {userData?.tier === 'FREE' ? 1 : userData?.tier === 'PREMIUM' ? 5 : 20} keys
            </p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition font-bold text-sm"
          >
            <Plus size={18} /> New Key
          </button>
        </div>

        {/* Create Form */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-6 bg-slate-700 rounded-lg border border-slate-600"
          >
            <h3 className="text-lg font-bold mb-4">Create New API Key</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Key name (e.g., Production, Development)"
                value={newKey.name}
                onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white focus:border-blue-400 outline-none"
              />
              <textarea
                placeholder="Description (optional)"
                value={newKey.description}
                onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded text-white focus:border-blue-400 outline-none resize-none"
                rows={2}
              />
              <div className="flex gap-4">
                <button
                  onClick={createKey}
                  disabled={!newKey.name}
                  className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 transition font-bold"
                >
                  Create Key
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-slate-600 rounded hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Keys List */}
        {keys.length === 0 ? (
          <div className="text-center p-12 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-slate-400 mb-4">No API keys yet</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 transition font-bold"
            >
              Create Your First Key
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {keys.map((key) => (
              <motion.div
                key={key.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-400 transition"
              >
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-lg font-bold">{key.name}</h3>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        key.isActive ? 'bg-green-600' : 'bg-red-600'
                      }`}>
                        {key.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    {key.description && (
                      <p className="text-slate-400 text-sm mb-3">{key.description}</p>
                    )}
                    <div className="flex items-center gap-2 mb-3 p-2 bg-slate-800 rounded font-mono text-xs">
                      <span className="truncate">{visibleKeys.has(key.id) ? key.key : '••••••••••••••••••••••••••'}</span>
                      <button onClick={() => toggleKeyVisibility(key.id)} className="ml-auto hover:text-blue-400 flex-shrink-0">
                        {visibleKeys.has(key.id) ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                      <button onClick={() => copyToClipboard(key.key)} className="hover:text-blue-400 flex-shrink-0">
                        <Copy size={14} />
                      </button>
                    </div>
                    <p className="text-xs text-slate-500">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-slate-800 rounded">
                      <div className="text-xs text-slate-400">Credits Used</div>
                      <div className="text-xl font-bold">{key.totalRequests}/{key.creditsDaily}</div>
                    </div>
                    <div className="p-3 bg-slate-800 rounded">
                      <div className="text-xs text-slate-400">Rate Limit</div>
                      <div className="text-xl font-bold">{key.rateLimit}/min</div>
                    </div>
                    <div className="p-3 bg-slate-800 rounded">
                      <div className="text-xs text-slate-400">Success</div>
                      <div className="text-xl font-bold">
                        {key.totalRequests === 0 ? '0%' : ((key.successRequests / key.totalRequests) * 100).toFixed(0)}%
                      </div>
                    </div>
                    {/* <div className="p-3 bg-slate-800 rounded">
                      <div className="text-xs text-slate-400">Total</div>
                      <div className="text-xl font-bold">{key.totalRequests}</div>
                    </div> */}
                    <div className="col-span-2">
                      <button
                        onClick={() => deleteKey(key.id)}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600/20 text-red-400 rounded hover:bg-red-600/40 transition border border-red-600/50 text-sm"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
