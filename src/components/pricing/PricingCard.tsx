'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, ArrowRight } from 'lucide-react'

interface PricingCardProps {
  name: string
  price: string
  yearlyPrice?: string
  period?: string
  credits: string
  keys: string
  rate: string
  features: string[]
  popular?: boolean
  index: number
  billing: 'monthly' | 'yearly'
}

export function PricingCard({
  name,
  price,
  yearlyPrice,
  period,
  credits,
  keys,
  rate,
  features,
  popular,
  index,
  billing,
}: PricingCardProps) {
  const displayPrice = billing === 'yearly' && yearlyPrice ? yearlyPrice : price

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1 }}
      className="relative"
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground px-3 py-1">Most popular</Badge>
        </div>
      )}
      <Card
        className={`h-full ${
          popular
            ? 'border-primary shadow-lg shadow-primary/10 scale-[1.02]'
            : 'hover:border-muted-foreground/30'
        } transition-all`}
      >
        <CardContent className="p-6 flex flex-col h-full">
          <div className="mb-6">
            <h3 className="font-semibold text-lg">{name}</h3>
            <div className="mt-3 mb-2">
              <span className="text-4xl font-bold">{displayPrice}</span>
              {period && <span className="text-sm text-muted-foreground">{period}</span>}
            </div>
            <p className="text-xs text-muted-foreground">
              {credits} &bull; {keys} &bull; {rate}
            </p>
          </div>

          <ul className="space-y-3 mb-6 flex-1">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2.5 text-sm">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{f}</span>
              </li>
            ))}
          </ul>

          <Link href="/login" className="block">
            <Button
              className="w-full group"
              variant={popular ? 'default' : 'outline'}
            >
              {name === 'VIP' ? 'Contact sales' : 'Get started'}
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </motion.div>
  )
}
