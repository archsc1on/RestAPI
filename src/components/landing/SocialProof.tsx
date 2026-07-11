'use client'

import { motion, useInView } from 'framer-motion'
import { useRef, useEffect, useState } from 'react'

interface CounterProps {
  target: number
  suffix?: string
  prefix?: string
}

function AnimatedCounter({ target, suffix = '', prefix = '' }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true })

  useEffect(() => {
    if (!isInView) return
    const duration = 1500
    const steps = 60
    const increment = target / steps
    let current = 0
    const timer = setInterval(() => {
      current += increment
      if (current >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(current))
      }
    }, duration / steps)
    return () => clearInterval(timer)
  }, [isInView, target])

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString()}{suffix}
    </span>
  )
}

const metrics = [
  { value: 10, suffix: 'M+', label: 'API calls served', prefix: '' },
  { value: 99, suffix: '.99%', label: 'Uptime guarantee', prefix: '' },
  { value: 50, suffix: 'ms', label: 'Avg latency', prefix: '< ' },
]

export function SocialProof() {
  return (
    <section className="py-12 px-4 border-y bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-8"
        >
          Trusted by teams building at scale
        </motion.p>
        <div className="grid grid-cols-3 gap-8">
          {metrics.map((m, i) => (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="text-center"
            >
              <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                <AnimatedCounter target={m.value} suffix={m.suffix} prefix={m.prefix} />
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground mt-1">{m.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
