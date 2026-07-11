'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqItems = [
  {
    q: 'What are credits?',
    a: 'Credits are consumed per API call. Each endpoint costs 1-3 credits depending on the category. Downloaders cost 3 credits, everything else costs 1 credit. Credits reset to your tier limit every day at midnight.',
  },
  {
    q: 'Do credits expire?',
    a: 'Credits reset to your tier limit every day at midnight UTC. Unused credits do not carry over to the next day. This ensures fair usage across all users.',
  },
  {
    q: 'Can I change plans later?',
    a: 'Yes! You can upgrade or downgrade your plan anytime from the dashboard. Upgrades take effect immediately, and you\'ll be charged the prorated difference. Downgrades take effect at the start of your next billing cycle.',
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept all major credit cards, bank transfers, and e-wallets through our payment partner Xendit. All transactions are secure and encrypted.',
  },
  {
    q: 'Is there a free trial?',
    a: 'The Free tier gives you 100 credits per day with no time limit. You can try all endpoints and see if MessageAPI fits your needs before upgrading.',
  },
  {
    q: 'What happens if I hit my limit?',
    a: 'When you reach your daily credit limit, API calls will return a 429 Too Many Requests error. Your credits reset at midnight UTC. You can upgrade your plan for higher limits at any time.',
  },
]

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="space-y-2">
      {faqItems.map((item, i) => (
        <div key={i} className="border rounded-lg overflow-hidden">
          <button
            onClick={() => setOpenIndex(openIndex === i ? null : i)}
            className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
          >
            <span className="font-medium text-sm">{item.q}</span>
            <motion.div
              animate={{ rotate: openIndex === i ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
            </motion.div>
          </button>
          <AnimatePresence>
            {openIndex === i && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="px-4 pb-4 text-sm text-muted-foreground leading-relaxed">
                  {item.a}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
