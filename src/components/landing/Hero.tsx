'use client'

import { motion, useReducedMotion } from 'framer-motion'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Copy, Check, Code2, Braces, Terminal } from 'lucide-react'
import { useState, useEffect } from 'react'
import { tokens } from '@/app/lib/tokens'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.messageapi.id'

const codeExamples = [
  {
    lang: 'cURL',
    code: `curl -X GET "${API_URL}/tools/weather?city=Jakarta" \\
  -H "x-api-key: YOUR_API_KEY"`,
  },
  {
    lang: 'Node.js',
    code: `const res = await fetch(
  "${API_URL}/tools/weather?city=Jakarta",
  { headers: { "x-api-key": "YOUR_API_KEY" } }
);
const data = await res.json();`,
  },
  {
    lang: 'Python',
    code: `import requests

res = requests.get(
    "${API_URL}/tools/weather?city=Jakarta",
    headers={"x-api-key": "YOUR_API_KEY"}
)
data = res.json()`,
  },
]

export function Hero() {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)
  const [isMobile, setIsMobile] = useState(true)
  const reduceMotion = useReducedMotion()

  useEffect(() => {
    setIsMobile(window.matchMedia('(max-width: 768px)').matches)
  }, [])

  const handleCopy = () => {
    navigator.clipboard.writeText(codeExamples[activeTab].code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const floatAnim = (isMobile || reduceMotion)
    ? {}
    : undefined

  return (
    <section className="relative pt-32 pb-20 px-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-transparent" />

      {!isMobile && !reduceMotion && (
        <>
          <motion.div
            className="absolute top-20 left-[10%] text-primary/20"
            animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Code2 className="w-8 h-8" />
          </motion.div>
          <motion.div
            className="absolute top-32 right-[15%] text-primary/15"
            animate={{ y: [0, 12, 0], rotate: [0, -8, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
          >
            <Braces className="w-10 h-10" />
          </motion.div>
          <motion.div
            className="absolute bottom-32 left-[8%] text-purple-500/15"
            animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          >
            <Terminal className="w-7 h-7" />
          </motion.div>
          <motion.div
            className="absolute top-48 left-[20%] text-blue-500/10 font-mono text-sm"
            animate={{ y: [0, -20, 0], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          >
            {'{ API }'}
          </motion.div>
          <motion.div
            className="absolute bottom-40 right-[12%] text-emerald-500/10 font-mono text-xs"
            animate={{ y: [0, 15, 0], opacity: [0.1, 0.2, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1.5 }}
          >
            200 OK
          </motion.div>
          <motion.div
            className="absolute top-24 right-[25%] text-primary/10 font-mono text-[10px]"
            animate={{ y: [0, -12, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 3 }}
          >
            rateLimit
          </motion.div>
          <motion.div
            className="absolute bottom-24 left-[25%] text-orange-500/10 font-mono text-[10px]"
            animate={{ y: [0, 10, 0], opacity: [0.1, 0.25, 0.1] }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 2.5 }}
          >
            x-api-key
          </motion.div>
        </>
      )}

      <div className="relative max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: tokens.motion.easeOut }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            60+ API endpoints available
          </div>
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both [animation-delay:100ms]">
          Ship APIs your
          <br />
          users actually{' '}
          <span className="text-primary">love</span>
        </h1>

        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 fill-mode-both [animation-delay:200ms]">
          MessageAPI handles routing, rate limiting, and monitoring so you can
          focus on what matters — your product.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3, ease: tokens.motion.easeOut }}
          className="flex flex-col sm:flex-row gap-3 justify-center mb-16"
        >
          <Button size="lg" asChild className="group">
            <Link href="/login">
              Start building free
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="/dashboard">View documentation</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4, ease: tokens.motion.easeOut }}
          className="relative max-w-3xl mx-auto"
        >
          <div className="rounded-xl border bg-card overflow-hidden shadow-2xl shadow-primary/5">
            <div className="flex items-center justify-between px-4 py-2.5 border-b bg-muted/50">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/80" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <div className="w-3 h-3 rounded-full bg-green-500/80" />
              </div>
              <div className="flex gap-1">
                {codeExamples.map((ex, i) => (
                  <button
                    key={ex.lang}
                    onClick={() => setActiveTab(i)}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                      activeTab === i
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {ex.lang}
                  </button>
                ))}
              </div>
              <button
                onClick={handleCopy}
                className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <pre className="p-4 text-left overflow-x-auto">
              <code className="text-sm font-mono text-foreground/80 leading-relaxed">
                {codeExamples[activeTab].code}
              </code>
            </pre>
          </div>
          <div className="absolute -inset-1 bg-gradient-to-b from-primary/10 to-transparent rounded-2xl -z-10 blur-xl" />
        </motion.div>
      </div>
    </section>
  )
}
