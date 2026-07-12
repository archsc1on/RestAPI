'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Copy, ArrowUp, Check, Zap, Search, ChevronRight } from 'lucide-react'
import { NavBar } from '@/components/layout/NavBar'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { StatsCards } from '@/components/dashboard/StatsCards'
import { ApiKeyList } from '@/components/dashboard/ApiKeyList'
import { endpoints, categoryColors } from '@/lib/api-registry'
import { API_BASE } from '@/app/lib/api'
import { SkeletonDashboard } from '@/components/ui/skeleton'
import { FloatingBackground } from '@/components/FloatingBackground'

interface ApiKey {
  id: string
  key: string
  name: string
  description?: string
  tier: string
  creditsDaily: number
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
  { name: 'FREE', price: 'Rp0', credits: '100/day', keys: '1 key', rate: '30 req/min', features: ['All endpoints', '1 API key', '100 credits/day'] },
  { name: 'PREMIUM', price: 'Rp25K', period: '/bulan', credits: '10K/day', keys: '5 keys', rate: '120 req/min', features: ['All endpoints', '5 API keys', '10K credits/day', 'IP whitelist'], popular: true },
  { name: 'VIP', price: 'Rp50K', period: '/bulan', credits: '100K/day', keys: '20 keys', rate: '500 req/min', features: ['All endpoints', '20 API keys', '100K credits/day', 'Custom limits'] },
]

const docCategories = [
  { name: 'ALL', count: endpoints.length },
  ...Object.keys(categoryColors)
    .map((n) => ({ name: n, count: endpoints.filter((d) => d.category === n).length }))
    .filter((c) => c.count > 0),
]

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [keys, setKeys] = useState<ApiKey[]>([])
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const [selected, setSelected] = useState('')
  const [search, setSearch] = useState('')
  const [cat, setCat] = useState('ALL')
  const [docTab, setDocTab] = useState('info')
  const [apiKeyInput, setApiKeyInput] = useState('')
  const [paramValues, setParamValues] = useState<Record<string, string>>({})
  const [apiLoading, setApiLoading] = useState(false)
  const [apiResponse, setApiResponse] = useState('')
  const [apiStatus, setApiStatus] = useState<number | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/login')
    if (status === 'authenticated') {
      loadData()
      const iv = setInterval(loadData, 10000)
      return () => clearInterval(iv)
    }
  }, [status, router])

  const loadData = async () => {
    try {
      const [keysRes, creditsRes] = await Promise.all([
        fetch('/api/user/keys'),
        fetch('/api/user/credits'),
      ])
      if (keysRes.ok) {
        const d = await keysRes.json()
        setKeys(d.data || [])
      }
      if (creditsRes.ok) {
        const d = await creditsRes.json()
        setUserData(d.data)
      }
    } catch {} finally {
      setLoading(false)
    }
  }

  const createKey = async (name: string, description: string) => {
    try {
      const r = await fetch('/api/user/keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description }),
      })
      const d = await r.json()
      if (d.status) {
        setKeys([...keys, d.data])
        loadData()
        toast.success('API key created!')
      } else {
        toast.error(d.message || 'Failed')
      }
    } catch {
      toast.error('Failed to create key')
    }
  }

  const deleteKey = async (id: string) => {
    try {
      const r = await fetch(`/api/user/keys/${id}`, { method: 'DELETE' })
      if (r.ok) {
        setKeys(keys.filter((k) => k.id !== id))
        toast.success('Key deleted')
      } else {
        toast.error('Failed to delete')
      }
    } catch {
      toast.error('Failed to delete')
    }
  }

  const upgradeTier = async (tier: string) => {
    setUpgrading(true)
    try {
      const r = await fetch('/api/user/upgrade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier }),
      })
      const d = await r.json()
      if (d.status) {
        loadData()
        toast.success(`Upgraded to ${tier}!`)
      } else {
        toast.error(d.message || 'Failed')
      }
    } catch {
      toast.error('Failed to upgrade')
    } finally {
      setUpgrading(false)
    }
  }

  const copyText = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      const t = document.createElement('textarea')
      t.value = text
      t.style.position = 'fixed'
      t.style.opacity = '0'
      document.body.appendChild(t)
      t.select()
      document.execCommand('copy')
      document.body.removeChild(t)
    }
    toast.success('Copied!', { duration: 1500 })
  }

  const runApi = async () => {
    if (!doc || !apiKeyInput) return
    setApiLoading(true)
    setApiResponse('')
    setApiStatus(null)
    try {
      const params = new URLSearchParams()
      doc.params.forEach((p) => {
        if (p.name !== 'x-api-key' && paramValues[p.name]) {
          params.set(p.name, paramValues[p.name])
        }
      })
      const url = `${API_BASE}${doc.endpoint}?${params.toString()}`
      const res = await fetch(url, { headers: { 'x-api-key': apiKeyInput } })
      setApiStatus(res.status)
      const text = await res.text()
      try {
        setApiResponse(JSON.stringify(JSON.parse(text), null, 2))
      } catch {
        setApiResponse(text)
      }
    } catch (err: any) {
      setApiResponse(`Error: ${err.message}`)
      setApiStatus(0)
    } finally {
      setApiLoading(false)
    }
  }

  const filteredDocs = useMemo(
    () =>
      endpoints.filter((d) => {
        const matchCat = cat === 'ALL' || d.category === cat
        const matchQ =
          !search ||
          d.name.toLowerCase().includes(search.toLowerCase()) ||
          d.endpoint.toLowerCase().includes(search.toLowerCase()) ||
          d.tags.some((t) => t.includes(search.toLowerCase()))
        return matchCat && matchQ
      }),
    [cat, search]
  )

  const doc = endpoints.find((d) => d.name === selected)

  if (status === 'loading' || loading) {
    return (
      <PageWrapper>
        <NavBar />
        <div className="max-w-6xl mx-auto px-4 py-6">
          <SkeletonDashboard />
        </div>
      </PageWrapper>
    )
  }

  const maxKeys = userData?.tier === 'FREE' ? 1 : userData?.tier === 'PREMIUM' ? 5 : 20

  return (
    <PageWrapper>
      <FloatingBackground />
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-6 space-y-8">
        <StatsCards
          userData={userData}
          keysCount={keys.length}
          maxKeys={maxKeys}
          onRefresh={loadData}
          onToggleUpgrade={() => setShowUpgrade(!showUpgrade)}
          showUpgrade={showUpgrade}
        />

        <AnimatePresence>
          {showUpgrade && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ArrowUp className="h-4 w-4" /> Upgrade Plan
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    {TIER_PLANS.map((p) => {
                      const isCurrent = userData?.tier === p.name
                      const tiers = ['FREE', 'PREMIUM', 'VIP']
                      const canUpgrade = tiers.indexOf(p.name) > tiers.indexOf(userData?.tier || 'FREE')
                      return (
                        <div
                          key={p.name}
                          className={`p-4 rounded-lg border transition-colors ${
                            isCurrent ? 'bg-primary/5 border-primary/30' : 'hover:bg-muted/50'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-semibold">{p.name}</span>
                            {p.popular && <Badge className="text-[9px] px-1 py-0">POPULAR</Badge>}
                            {isCurrent && <Badge variant="success" className="text-[9px] px-1 py-0">CURRENT</Badge>}
                          </div>
                          <div className="mb-1">
                            <span className="text-2xl font-bold">{p.price}</span>
                            {p.period && <span className="text-xs text-muted-foreground">{p.period}</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {p.credits} &bull; {p.keys} &bull; {p.rate}
                          </p>
                          <ul className="space-y-1.5 mb-4">
                            {p.features.map((f, i) => (
                              <li key={i} className="flex items-center gap-1.5 text-xs">
                                <Check className="h-3 w-3 text-emerald-400 shrink-0" />
                                {f}
                              </li>
                            ))}
                          </ul>
                          <Button
                            size="sm"
                            variant={isCurrent ? 'secondary' : canUpgrade ? 'default' : 'outline'}
                            disabled={isCurrent || !canUpgrade || upgrading}
                            onClick={() => upgradeTier(p.name)}
                            className="w-full"
                          >
                            {isCurrent ? 'Current' : canUpgrade ? (upgrading ? 'Upgrading...' : 'Upgrade') : 'N/A'}
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <ApiKeyList keys={keys} maxKeys={maxKeys} onCreate={createKey} onDelete={deleteKey} />

        <section id="docs-section">
          <Separator className="mb-6" />
          <div className="flex items-center gap-3 mb-4">
            <h2 className="text-xl font-bold">Documentation</h2>
            <span className="text-sm text-muted-foreground">{endpoints.length} endpoints</span>
            <span className="ml-auto text-xs text-muted-foreground">
              Base: <code className="text-primary">{API_BASE}</code>
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-1 space-y-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search endpoints..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {docCategories.map((c) => (
                  <Button
                    key={c.name}
                    size="sm"
                    variant={cat === c.name ? 'default' : 'ghost'}
                    className="shrink-0 text-xs h-7"
                    onClick={() => setCat(c.name)}
                  >
                    {c.name}
                    <Badge variant="secondary" className="ml-1 text-[10px] h-4 px-1">
                      {c.count}
                    </Badge>
                  </Button>
                ))}
              </div>
              <ScrollArea className="h-[50vh]">
                <div className="space-y-1.5 pr-2">
                  {filteredDocs.map((d) => (
                    <button
                      key={d.name}
                      onClick={() => {
                        setSelected(d.name)
                        setDocTab('info')
                        setParamValues({})
                        setApiResponse('')
                        setApiStatus(null)
                      }}
                      className={`w-full text-left p-2.5 rounded-lg border transition-colors ${
                        selected === d.name
                          ? 'bg-primary/10 border-primary/50'
                          : 'bg-card hover:border-muted-foreground/30'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <Badge variant={d.method === 'GET' ? 'default' : 'secondary'} className="text-[10px] px-1.5 py-0">
                          {d.method}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{d.category}</span>
                        <span className="ml-auto text-[10px] text-primary font-medium">{d.cost}cr</span>
                      </div>
                      <div className="text-xs font-medium">{d.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{d.endpoint}</div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="lg:col-span-2">
              {doc ? (
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <span>{doc.category}</span>
                      <ChevronRight className="h-3 w-3" />
                      <span className="text-foreground font-medium">{doc.name}</span>
                    </div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant={doc.method === 'GET' ? 'default' : 'secondary'}>{doc.method}</Badge>
                      <Badge variant="outline">v1.0.0</Badge>
                    </div>
                    <h2 className="text-xl font-bold mb-1">{doc.name}</h2>
                    <p className="text-sm text-muted-foreground mb-3">{doc.description}</p>
                    <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2 mb-3">
                      <Badge variant={doc.method === 'GET' ? 'default' : 'secondary'} className="text-[10px]">
                        {doc.method}
                      </Badge>
                      <code className="text-sm text-primary flex-1 font-mono truncate">
                        {API_BASE}{doc.endpoint}
                      </code>
                      <Button variant="ghost" size="sm" className="h-7" onClick={() => copyText(`${API_BASE}${doc.endpoint}`)}>
                        <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                      </Button>
                    </div>
                    <Tabs value={docTab} onValueChange={setDocTab}>
                      <TabsList className="mb-3">
                        <TabsTrigger value="info">Info</TabsTrigger>
                        <TabsTrigger value="code">Code</TabsTrigger>
                      </TabsList>
                      <TabsContent value="info" className="space-y-3">
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { l: 'AUTH', v: 'API Key', c: 'text-primary' },
                            { l: 'COST', v: `${doc.cost} Credit`, c: 'text-primary' },
                            { l: 'TIER', v: 'Free', c: 'text-emerald-500' },
                            { l: 'TIMEOUT', v: '3s', c: '' },
                          ].map((i) => (
                            <div key={i.l} className="bg-muted rounded-lg p-2">
                              <div className="text-[10px] text-muted-foreground uppercase">{i.l}</div>
                              <div className={`text-xs font-semibold mt-0.5 ${i.c}`}>{i.v}</div>
                            </div>
                          ))}
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Tags</h4>
                          <div className="flex gap-1 flex-wrap">
                            {doc.tags.map((t) => (
                              <Badge key={t} variant="secondary" className="text-[10px]">
                                #{t}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <h4 className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Parameters</h4>
                          <div className="border rounded-lg overflow-hidden">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-muted">
                                  <th className="text-left px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground">NAME</th>
                                  <th className="text-left px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground">TYPE</th>
                                  <th className="text-left px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground">REQ</th>
                                  <th className="text-left px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground">DESC</th>
                                </tr>
                              </thead>
                              <tbody>
                                {doc.params.map((p, i) => (
                                  <tr key={i} className="border-t">
                                    <td className="px-2.5 py-1.5 font-mono text-primary">{p.name}</td>
                                    <td className="px-2.5 py-1.5">
                                      <Badge variant="outline" className="text-[10px]">{p.type}</Badge>
                                    </td>
                                    <td className="px-2.5 py-1.5">
                                      {p.required ? (
                                        <Badge variant="destructive" className="text-[10px]">Yes</Badge>
                                      ) : (
                                        <span className="text-muted-foreground">No</span>
                                      )}
                                    </td>
                                    <td className="px-2.5 py-1.5 text-muted-foreground">{p.description}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                        {doc.body && doc.body.length > 0 && (
                          <div>
                            <h4 className="text-[10px] font-semibold uppercase text-muted-foreground mb-1.5">Request Body</h4>
                            <div className="border rounded-lg overflow-hidden">
                              <table className="w-full text-xs">
                                <thead>
                                  <tr className="bg-muted">
                                    <th className="text-left px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground">NAME</th>
                                    <th className="text-left px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground">TYPE</th>
                                    <th className="text-left px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground">REQ</th>
                                    <th className="text-left px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground">DESC</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {doc.body.map((f, i) => (
                                    <tr key={i} className="border-t">
                                      <td className="px-2.5 py-1.5 font-mono text-primary">{f.name}</td>
                                      <td className="px-2.5 py-1.5">
                                        <Badge variant="outline" className="text-[10px]">{f.type}</Badge>
                                      </td>
                                      <td className="px-2.5 py-1.5">
                                        {f.required ? (
                                          <Badge variant="destructive" className="text-[10px]">Yes</Badge>
                                        ) : (
                                          <span className="text-muted-foreground">No</span>
                                        )}
                                      </td>
                                      <td className="px-2.5 py-1.5 text-muted-foreground">{f.description}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}
                      </TabsContent>
                      <TabsContent value="code" className="space-y-4">
                        <div>
                          <h4 className="text-xs font-semibold mb-2">API Key</h4>
                          <Input
                            placeholder="sk_..."
                            value={apiKeyInput}
                            onChange={(e) => setApiKeyInput(e.target.value)}
                            className="font-mono text-xs"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-semibold mb-2">Parameters</h4>
                          <div className="space-y-2">
                            {doc.params
                              .filter((p) => p.name !== 'x-api-key')
                              .map((p) => (
                                <div key={p.name} className="flex items-center gap-2">
                                  <span className="text-xs font-mono text-primary w-24 shrink-0">{p.name}</span>
                                  <Input
                                    placeholder={`${p.description}${p.required ? ' *' : ''}`}
                                    value={paramValues[p.name] || ''}
                                    onChange={(e) => setParamValues({ ...paramValues, [p.name]: e.target.value })}
                                    className="text-xs h-8"
                                  />
                                </div>
                              ))}
                          </div>
                        </div>
                        <Button size="sm" onClick={runApi} disabled={!apiKeyInput || apiLoading} className="w-full">
                          {apiLoading ? 'Running...' : 'Run'}
                        </Button>
                        {apiStatus !== null && (
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="text-xs font-semibold">Response</h4>
                              <Badge variant={apiStatus >= 200 && apiStatus < 300 ? 'default' : 'destructive'} className="text-[10px]">
                                {apiStatus}
                              </Badge>
                            </div>
                            <pre className="bg-muted rounded-lg p-3 text-xs font-mono overflow-x-auto max-h-[300px] overflow-y-auto">
                              {apiResponse}
                            </pre>
                          </div>
                        )}
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-[400px] flex items-center justify-center">
                  <CardContent className="text-center">
                    <Zap className="h-10 w-10 mx-auto mb-2 text-muted-foreground/30" />
                    <p className="text-sm text-muted-foreground">Select an endpoint to view documentation</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </section>

        <div className="h-8" />
      </div>
    </PageWrapper>
  )
}
