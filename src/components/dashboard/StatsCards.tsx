'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { CreditCard, Zap, BarChart3, Key, RefreshCw, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { UsageChart } from './UsageChart'

interface UserData {
  credits: number
  tier: string
  creditsDaily: number
  creditsUsedToday: number
}

interface UsageData {
  today: { used: number; limit: number }
  week: { used: number; limit: number }
  month: { used: number; limit: number }
  year: { used: number; limit: number }
  daily: { date: string; used: number }[]
}

interface StatsCardsProps {
  userData: UserData | null
  keysCount: number
  maxKeys: number
  onRefresh: () => void
  onToggleUpgrade: () => void
  showUpgrade: boolean
}

const periods = [
  { key: 'today', label: 'Hari' },
  { key: 'week', label: 'Minggu' },
  { key: 'month', label: 'Bulan' },
  { key: 'year', label: 'Tahun' },
] as const

type PeriodKey = (typeof periods)[number]['key']

export function StatsCards({ userData, keysCount, maxKeys, onRefresh, onToggleUpgrade, showUpgrade }: StatsCardsProps) {
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [activePeriod, setActivePeriod] = useState<PeriodKey>('today')

  useEffect(() => {
    fetchUsage()
  }, [])

  const fetchUsage = async () => {
    try {
      const res = await fetch('/api/user/usage')
      if (res.ok) {
        const d = await res.json()
        setUsage(d.data)
      }
    } catch {}
  }

  const currentUsage = usage?.[activePeriod]
  const usagePct = currentUsage?.limit ? Math.round((currentUsage.used / currentUsage.limit) * 100) : 0

  const cards = [
    {
      icon: CreditCard,
      label: 'Credits',
      value: userData?.credits ?? '-',
      sub: 'Resets daily',
      color: 'text-primary',
      gradient: 'from-primary/5 to-transparent',
      action: (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { onRefresh(); fetchUsage() }}>
              <RefreshCw className="h-3 w-3" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Refresh</TooltipContent>
        </Tooltip>
      ),
    },
    {
      icon: Zap,
      label: 'Plan',
      value: userData?.tier || 'FREE',
      sub: `${maxKeys} keys max`,
      color: 'text-purple-500',
      gradient: 'from-purple-500/5 to-transparent',
      action: (
        <button onClick={onToggleUpgrade}>
          <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${showUpgrade ? 'rotate-180' : ''}`} />
        </button>
      ),
    },
    {
      icon: BarChart3,
      label: 'Usage',
      isUsage: true,
      color: 'text-emerald-500',
      gradient: 'from-emerald-500/5 to-transparent',
    },
    {
      icon: Key,
      label: 'API Keys',
      value: (
        <>
          {keysCount}
          <span className="text-sm text-muted-foreground font-normal"> / {maxKeys}</span>
        </>
      ),
      sub: 'Active keys',
      color: 'text-orange-500',
      gradient: 'from-orange-500/5 to-transparent',
    },
  ]

  return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
        >
          <Card className="relative overflow-hidden">
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient}`} />
            <CardContent className="p-4 relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <card.icon className={`h-4 w-4 ${card.color}`} />
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                {'action' in card && card.action}
              </div>

              {card.isUsage ? (
                <div>
                  {/* Period tabs */}
                  <div className="flex gap-1 mb-2">
                    {periods.map((p) => (
                      <button
                        key={p.key}
                        onClick={() => setActivePeriod(p.key)}
                        className={`px-2 py-0.5 text-[10px] font-medium rounded transition-colors ${
                          activePeriod === p.key
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>

                  {/* Usage number */}
                  <div className="text-2xl font-bold">
                    {currentUsage?.used ?? 0}
                    <span className="text-sm text-muted-foreground font-normal">
                      {' '}/ {currentUsage?.limit ?? 0}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-emerald-500 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(usagePct, 100)}%` }}
                      transition={{ duration: 0.5, ease: 'easeOut' }}
                    />
                  </div>

                  {/* Mini chart (30 days) */}
                  {usage?.daily && activePeriod === 'month' && (
                    <UsageChart data={usage.daily} />
                  )}
                </div>
              ) : (
                <>
                  <div className="text-2xl font-bold">{card.value}</div>
                  {'sub' in card && card.sub && <p className="text-[11px] text-muted-foreground mt-1">{card.sub}</p>}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      ))}
    </div>
  )
}
