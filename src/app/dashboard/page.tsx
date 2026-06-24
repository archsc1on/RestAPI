'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Trash2, Plus, Eye, EyeOff, LogOut, Zap, CreditCard, BarChart3, RefreshCw, ArrowUp, Check } from 'lucide-react'
import toast from 'react-hot-toast'

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

const TIER_PLANS = [
  {
    name: 'FREE',
    price: 'Rp0',
    credits: '100/day',
    keys: '1 key',
    rateLimit: '30 req/min',
    color: 'from-slate-600 to-slate-700',
    border: 'border-slate-500',
    badge: 'bg-slate-500',
    features: ['All endpoints', '1 API key', '100 credits/day']
  },
  {
    name: 'PREMIUM',
    price: 'Rp25K',
    period: '/bulan',
    credits: '10K/day',
    keys: '5 keys',
    rateLimit: '120 req/min',
    color: 'from-blue-600 to-purple-600',
    border: 'border-blue-400',
    badge: 'bg-blue-500',
    features: ['All endpoints', '5 API keys', '10K credits/day', 'IP whitelist'],
    popular: true
  },
  {
    name: 'VIP',
    price: 'Rp50K',
    period: '/bulan',
    credits: '100K/day',
    keys: '20 keys',
    rateLimit: '500 req/min',
    color: 'from-purple-600 to-pink-600',
    border: 'border-purple-400',
    badge: 'bg-purple-500',
    features: ['All endpoints', '20 API keys', '100K credits/day', 'IP whitelist', 'Custom limits']
  }
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [newKey, setNewKey] = useState({ name: '', description: '' })
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
    if (status === 'authenticated') {
      loadApiKeys()
      loadUserData()

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
        loadUserData()
        toast.success('API key created!', { duration: 2000 })
      } else {
        toast.error(data.message || 'Failed to create key', { duration: 3000 })
      }
    } catch (error) {
      console.error('Failed to create key:', error)
      toast.error('Failed to create key', { duration: 3000 })
    }
  }

  const deleteKey = async (id: string) => {
    if (confirm('Delete this API key?')) {
      try {
        const res = await fetch(`/api/user/keys/${id}`, { method: 'DELETE' })
        if (res.ok) {
          setKeys(keys.filter(k => k.id !== id))
          toast.success('Key deleted', { duration: 2000 })
        } else {
          toast.error('Failed to delete key', { duration: 3000 })
        }
      } catch (error) {
        console.error('Failed to delete key:', error)
        toast.error('Failed to delete key', { duration: 3000 })
      }
    }
  }

  const upgradeTier = async (tier: string) => {
    if (!confirm(`Upgrade to ${tier}?`)) return
    setUpgrading(true)
    try {
      const res = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier })
      })
      const data = await res.json()
      if (data.status) {
        loadUserData()
        loadApiKeys()
        setShowUpgrade(false)
        toast.success(`Upgraded to ${tier}!`, { duration: 2000 })
      } else {
        toast.error(data.message || 'Failed to upgrade', { duration: 3000 })
      }
    } catch (error) {
      console.error('Failed to upgrade:', error)
      toast.error('Failed to upgrade', { duration: 3000 })
    } finally {
      setUpgrading(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success('Copied to clipboard!', { duration: 1500 })
    } catch {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      toast.success('Copied to clipboard!', { duration: 1500 })
    }
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
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Dashboard
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-blue-400 transition">Home</a>
            <a href="/docs" className="hover:text-blue-400 transition">Docs</a>
            <a href="/pricing" className="hover:text-blue-400 transition">Pricing</a>
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
              <button onClick={() => { loadUserData(); loadApiKeys() }} className="p-1 hover:bg-slate-600 rounded transition" title="Refresh">
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
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-600/20 rounded">
                  <Zap size={20} className="text-purple-400" />
                </div>
                <span className="text-slate-400 text-sm">Plan</span>
              </div>
              <button onClick={() => setShowUpgrade(!showUpgrade)} className="p-1 hover:bg-slate-600 rounded transition" title="Upgrade">
                <ArrowUp size={14} className="text-purple-400" />
              </button>
            </div>
            <div className={`text-2xl font-bold ${tierColors[userData?.tier || 'FREE']}`}>
              {userData?.tier || 'FREE'}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              {userData?.tier === 'FREE' ? '1 key max' : userData?.tier === 'PREMIUM' ? '5 keys max' : '20 keys max'}
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

        {showUpgrade && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 p-6 bg-slate-700/50 rounded-xl border border-slate-600"
          >
            <h2 className="text-xl font-bold mb-4">Upgrade Your Plan</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {TIER_PLANS.map((plan) => {
                const isCurrent = userData?.tier === plan.name
                const tiers = ['FREE', 'PREMIUM', 'VIP']
                const currentIdx = tiers.indexOf(userData?.tier || 'FREE')
                const planIdx = tiers.indexOf(plan.name)
                const canUpgrade = planIdx > currentIdx

                return (
                  <div
                    key={plan.name}
                    className={`relative p-5 rounded-xl border transition ${
                      plan.popular ? `${plan.border} bg-gradient-to-br ${plan.color}` : 'border-slate-600 bg-slate-800/50'
                    } ${isCurrent ? 'ring-2 ring-green-500' : ''}`}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                        POPULAR
                      </div>
                    )}
                    {isCurrent && (
                      <div className="absolute -top-3 right-4 px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                        <Check size={10} /> CURRENT
                      </div>
                    )}
                    <h3 className="text-lg font-bold mb-1">{plan.name}</h3>
                    <div className="flex items-baseline gap-1 mb-2">
                      <span className="text-2xl font-bold">{plan.price}</span>
                      {plan.period && <span className="text-xs text-slate-300">{plan.period}</span>}
                    </div>
                    <div className="text-xs text-slate-400 mb-3">{plan.credits} &bull; {plan.keys} &bull; {plan.rateLimit}</div>
                    <ul className="space-y-1 mb-4">
                      {plan.features.map((f, i) => (
                        <li key={i} className="flex items-center gap-1.5 text-xs">
                          <Check size={10} className="text-green-400" /> {f}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => upgradeTier(plan.name)}
                      disabled={isCurrent || !canUpgrade || upgrading}
                      className={`w-full py-2 rounded-lg font-bold text-sm transition ${
                        isCurrent
                          ? 'bg-green-600/20 text-green-400 cursor-default'
                          : canUpgrade
                            ? 'bg-blue-500 hover:bg-blue-600'
                            : 'bg-slate-600 text-slate-400 cursor-not-allowed'
                      }`}
                    >
                      {isCurrent ? 'Current Plan' : canUpgrade ? (upgrading ? 'Upgrading...' : 'Upgrade') : 'Downgrade'}
                    </button>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

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
                <button onClick={createKey} disabled={!newKey.name} className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 disabled:opacity-50 transition font-bold">
                  Create Key
                </button>
                <button onClick={() => setShowForm(false)} className="px-6 py-2 bg-slate-600 rounded hover:bg-slate-700 transition">
                  Cancel
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {keys.length === 0 ? (
          <div className="text-center p-12 bg-slate-700/50 rounded-lg border border-slate-600">
            <p className="text-slate-400 mb-4">No API keys yet</p>
            <button onClick={() => setShowForm(true)} className="px-6 py-2 bg-blue-500 rounded hover:bg-blue-600 transition font-bold">
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
                      <span className={`px-2 py-1 rounded text-xs font-bold ${key.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
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
