'use client'

import { motion } from 'framer-motion'

interface BillingToggleProps {
  billing: 'monthly' | 'yearly'
  onToggle: (billing: 'monthly' | 'yearly') => void
}

export function BillingToggle({ billing, onToggle }: BillingToggleProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <button
        onClick={() => onToggle('monthly')}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          billing === 'monthly' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Monthly
        {billing === 'monthly' && (
          <motion.div
            layoutId="billing-toggle"
            className="absolute inset-0 bg-muted rounded-lg -z-10"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </button>
      <button
        onClick={() => onToggle('yearly')}
        className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
          billing === 'yearly' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
        }`}
      >
        Yearly
        <span className="ml-1.5 text-xs text-emerald-500 font-semibold">Save 20%</span>
        {billing === 'yearly' && (
          <motion.div
            layoutId="billing-toggle"
            className="absolute inset-0 bg-muted rounded-lg -z-10"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          />
        )}
      </button>
    </div>
  )
}
