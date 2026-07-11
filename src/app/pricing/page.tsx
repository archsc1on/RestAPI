'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { NavBar } from '@/components/layout/NavBar'
import { Footer } from '@/components/layout/Footer'
import { PageWrapper } from '@/components/layout/PageWrapper'
import { PricingCard } from '@/components/pricing/PricingCard'
import { BillingToggle } from '@/components/pricing/BillingToggle'
import { FAQ } from '@/components/pricing/FAQ'
import { FloatingBackground } from '@/components/FloatingBackground'

const plans = [
  {
    name: 'Free',
    price: 'Rp0',
    yearlyPrice: 'Rp0',
    credits: '100/day',
    keys: '1 key',
    rate: '30 req/min',
    features: ['All API endpoints', '1 API key', '100 credits/day', 'Community support'],
  },
  {
    name: 'Premium',
    price: 'Rp25K',
    yearlyPrice: 'Rp20K',
    period: '/bulan',
    credits: '10K/day',
    keys: '5 keys',
    rate: '120 req/min',
    features: ['All API endpoints', '5 API keys', '10K credits/day', 'IP whitelist', 'Priority support'],
    popular: true,
  },
  {
    name: 'VIP',
    price: 'Rp50K',
    yearlyPrice: 'Rp40K',
    period: '/bulan',
    credits: '100K/day',
    keys: '20 keys',
    rate: '500 req/min',
    features: ['All API endpoints', '20 API keys', '100K credits/day', 'IP whitelist', 'Custom limits', 'Dedicated support'],
  },
]

const costs = [
  { cat: 'TEXT', items: ['Translate', 'TTS', 'QR Code', 'Short URL', 'Word Count', 'Base64'] },
  { cat: 'DOWNLOADER', items: ['YouTube DL', 'Instagram DL', 'TikTok DL', 'Twitter/X DL', 'Facebook DL'] },
  { cat: 'ANIME', items: ['Anime Search', 'Anime Detail', 'Manga', 'Character', 'Schedule', 'Waifu'] },
  { cat: 'INFO', items: ['IP Lookup', 'Weather', 'News', 'Dictionary', 'Currency', 'Crypto'] },
  { cat: 'DATA', items: ['GitHub Profile', 'GitHub Repos', 'Random User', 'Jokes', 'Quotes', 'Cat'] },
  { cat: 'MEDIA', items: ['Album Art', 'Artist Info', 'Font Search', 'Wallpaper', 'Lyrics', 'Book'] },
]

export default function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <PageWrapper noPadding>
      <FloatingBackground />
      <NavBar />

      <div className="max-w-6xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-center mb-10"
        >
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Credits reset daily. Pay only for what you need.
          </p>
        </motion.div>

        <div className="mb-10">
          <BillingToggle billing={billing} onToggle={setBilling} />
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-16">
          {plans.map((p, i) => (
            <PricingCard
              key={p.name}
              {...p}
              index={i}
              billing={billing}
            />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16"
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Credit costs by category</h2>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {costs.map((c) => (
                  <div key={c.cat}>
                    <h3 className="text-sm font-semibold mb-3 text-foreground">{c.cat}</h3>
                    <div className="space-y-1">
                      {c.items.map((item) => (
                        <div
                          key={item}
                          className="flex items-center justify-between text-xs py-1.5 border-b border-border/50"
                        >
                          <span className="text-muted-foreground">{item}</span>
                          <Badge variant="secondary" className="text-[10px]">
                            {c.cat === 'DOWNLOADER' ? '3 cr' : '1 cr'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-6">Frequently asked questions</h2>
              <FAQ />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <Footer />
    </PageWrapper>
  )
}
