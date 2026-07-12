'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Orb {
  id: number
  x: number
  y: number
  size: number
  color: string
  duration: number
  delay: number
}

const COLORS = [
  'bg-primary/20',
  'bg-primary/10',
  'bg-purple-500/10',
  'bg-blue-500/10',
  'bg-indigo-500/10',
]

function generateOrbs(count: number): Orb[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 200 + 100,
    color: COLORS[i % COLORS.length],
    duration: Math.random() * 20 + 20,
    delay: Math.random() * 5,
  }))
}

export function FloatingBackground() {
  const [orbs, setOrbs] = useState<Orb[]>([])
  const [isMobile, setIsMobile] = useState(false)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const mobile = window.matchMedia('(max-width: 768px)').matches
    setIsMobile(mobile)
    setOrbs(generateOrbs(mobile ? 2 : 4))
  }, [])

  if (orbs.length === 0) return null

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      {orbs.map((orb) => (
        <motion.div
          key={orb.id}
          className={`absolute rounded-full blur-3xl ${orb.color}`}
          style={{
            width: orb.size,
            height: orb.size,
            left: `${orb.x}%`,
            top: `${orb.y}%`,
            willChange: 'transform',
            transform: 'translateZ(0)',
          }}
          animate={
            reduceMotion || isMobile
              ? {}
              : {
                  x: [0, 30, -20, 10, 0],
                  y: [0, -20, 30, -10, 0],
                  scale: [1, 1.1, 0.95, 1.05, 1],
                }
          }
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'linear',
            delay: orb.delay,
          }}
        />
      ))}

      <div
        className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
    </div>
  )
}

export function FloatingDots() {
  const [dots, setDots] = useState<{ id: number; x: number; y: number; size: number; delay: number }[]>([])
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    const isMobile = window.matchMedia('(max-width: 768px)').matches
    if (isMobile) return
    setDots(
      Array.from({ length: 12 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 5,
      }))
    )
  }, [])

  if (dots.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {dots.map((dot) => (
        <motion.div
          key={dot.id}
          className="absolute rounded-full bg-primary/30"
          style={{
            width: dot.size,
            height: dot.size,
            left: `${dot.x}%`,
            top: `${dot.y}%`,
            willChange: 'transform, opacity',
          }}
          animate={
            reduceMotion
              ? {}
              : { y: [0, -30, 0], opacity: [0.2, 0.6, 0.2] }
          }
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: dot.delay,
          }}
        />
      ))}
    </div>
  )
}

export function GlowOrb({ className }: { className?: string }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      className={`absolute rounded-full blur-3xl bg-primary/15 ${className}`}
      style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
      animate={
        reduceMotion
          ? {}
          : { scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }
      }
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    />
  )
}
