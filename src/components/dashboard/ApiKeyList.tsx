'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { Copy, Trash2, Plus, Eye, EyeOff, Key, ChevronDown, ChevronUp } from 'lucide-react'
import toast from 'react-hot-toast'

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

interface ApiKeyListProps {
  keys: ApiKey[]
  maxKeys: number
  onCreate: (name: string, description: string) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function ApiKeyList({ keys, maxKeys, onCreate, onDelete }: ApiKeyListProps) {
  const [showForm, setShowForm] = useState(false)
  const [newKey, setNewKey] = useState({ name: '', description: '' })
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set())
  const [showAllKeys, setShowAllKeys] = useState(false)

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

  const toggleVisibility = (id: string) => {
    const s = new Set(visibleKeys)
    s.has(id) ? s.delete(id) : s.add(id)
    setVisibleKeys(s)
  }

  const handleCreate = async () => {
    await onCreate(newKey.name, newKey.description)
    setNewKey({ name: '', description: '' })
    setShowForm(false)
  }

  const visibleKeysList = showAllKeys ? keys : keys.slice(0, 5)
  const hasMoreKeys = keys.length > 5

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold">API Keys</h2>
          <p className="text-sm text-muted-foreground">{keys.length} / {maxKeys} keys</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(!showForm)} disabled={keys.length >= maxKeys && !showForm}>
          <Plus className="h-4 w-4 mr-1" /> New Key
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4"
          >
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Create API Key</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Input
                  placeholder="Key name (e.g., Production)"
                  value={newKey.name}
                  onChange={(e) => setNewKey({ ...newKey, name: e.target.value })}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newKey.description}
                  onChange={(e) => setNewKey({ ...newKey, description: e.target.value })}
                  rows={2}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleCreate} disabled={!newKey.name}>
                    Create
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {keys.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-12 text-center">
            <Key className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground mb-4">No API keys yet</p>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-1" /> Create your first key
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {visibleKeysList.map((key) => (
            <motion.div
              key={key.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="hover:border-primary/30 transition-colors">
                <CardContent className="p-4">
                  <div className="flex flex-col md:flex-row md:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="font-semibold text-sm">{key.name}</h3>
                        <Badge variant={key.isActive ? 'success' : 'destructive'} className="text-[10px]">
                          {key.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      {key.description && (
                        <p className="text-xs text-muted-foreground mb-1.5">{key.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 bg-muted rounded-md px-2.5 py-1 font-mono text-xs max-w-lg">
                        <span className="truncate flex-1">
                          {visibleKeys.has(key.id) ? key.key : '••••••••••••••••••••••••••••••••'}
                        </span>
                        <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" aria-label={visibleKeys.has(key.id) ? 'Hide API key' : 'Show API key'} onClick={() => toggleVisibility(key.id)}>
                          {visibleKeys.has(key.id) ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-5 w-5 shrink-0" aria-label="Copy API key" onClick={() => copyText(key.key)}>
                              <Copy className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>Copy</TooltipContent>
                        </Tooltip>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        Created {new Date(key.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-center">
                        <div className="text-base font-bold">{key.totalRequests}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">Req</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold">{key.rateLimit}</div>
                        <div className="text-[9px] text-muted-foreground uppercase">/min</div>
                      </div>
                      <div className="text-center">
                        <div className="text-base font-bold">
                          {key.totalRequests === 0 ? '0' : ((key.successRequests / key.totalRequests) * 100).toFixed(0)}%
                        </div>
                        <div className="text-[9px] text-muted-foreground uppercase">OK</div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        aria-label={`Delete key ${key.name}`}
                        onClick={() => onDelete(key.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
          {hasMoreKeys && (
            <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowAllKeys(!showAllKeys)}>
              {showAllKeys ? (
                <><ChevronUp className="h-4 w-4 mr-1" /> Show Less</>
              ) : (
                <><ChevronDown className="h-4 w-4 mr-1" /> Show All ({keys.length} keys)</>
              )}
            </Button>
          )}
        </div>
      )}
    </section>
  )
}
