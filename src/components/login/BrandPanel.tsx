'use client'

import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'
import { tokens } from '@/app/lib/tokens'

export function BrandPanel() {
  return (
    <div className="hidden lg:flex relative w-1/2 bg-gradient-to-br from-primary/20 via-primary/10 to-background items-center justify-center p-12 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(var(--primary)/0.15),transparent_70%)]" />

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: tokens.motion.easeOut }}
        className="relative z-10 max-w-md"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20">
            <Zap className="w-6 h-6 text-primary" />
          </div>
          <span className="text-2xl font-bold text-foreground">MessageAPI</span>
        </div>

        <h2 className="text-3xl font-bold text-foreground mb-4 leading-tight">
          Build APIs your users actually love
        </h2>
        <p className="text-muted-foreground text-lg leading-relaxed">
          One API for messaging, downloads, tools, and more. Simple, secure, scalable.
        </p>

        <div className="mt-10 space-y-4">
          {[
            '60+ API endpoints',
            'Real-time analytics',
            'Enterprise-grade security',
          ].map((item, i) => (
            <motion.div
              key={item}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
              className="flex items-center gap-3 text-foreground/80"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-sm">{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  )
}
