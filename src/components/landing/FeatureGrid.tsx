'use client'

import { motion } from 'framer-motion'
import { Code2, Shield, Zap, BarChart3, Download, Globe } from 'lucide-react'

const features = [
  {
    icon: Code2,
    title: 'Unified API',
    desc: 'One endpoint for messaging, tools, downloads, and more',
    accent: 'group-hover:text-blue-500',
  },
  {
    icon: Shield,
    title: 'Secure by default',
    desc: 'API key auth with rate limiting, IP whitelist, brute force protection',
    accent: 'group-hover:text-emerald-500',
  },
  {
    icon: Zap,
    title: 'Low latency',
    desc: 'Optimized for speed with real-time analytics and monitoring',
    accent: 'group-hover:text-yellow-500',
  },
  {
    icon: BarChart3,
    title: 'Real-time analytics',
    desc: 'Usage tracking, credit monitoring, and detailed request logs',
    accent: 'group-hover:text-purple-500',
  },
  {
    icon: Download,
    title: 'Media downloaders',
    desc: 'YouTube, Instagram, TikTok, Twitter — direct MP3/MP4 links',
    accent: 'group-hover:text-pink-500',
  },
  {
    icon: Globe,
    title: '60+ tools',
    desc: 'Text utilities, anime data, weather, crypto, random data, and more',
    accent: 'group-hover:text-orange-500',
  },
]

export function FeatureGrid() {
  return (
    <section className="py-20 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Everything you need</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            A complete API toolkit that handles the infrastructure so you can build your product.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative rounded-xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/30 overflow-hidden will-change-transform"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative">
                <div className={`w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 transition-colors duration-300 ${f.accent}`}>
                  <f.icon className="w-5 h-5 text-primary transition-colors duration-300 group-hover:text-foreground" />
                </div>
                <h3 className="font-semibold mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
