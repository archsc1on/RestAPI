'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Code2, Zap, Shield, BarChart3, ArrowRight, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Code2,
    title: 'Unified API',
    description: 'Single endpoint for WhatsApp, Telegram, and Discord'
  },
  {
    icon: Shield,
    title: 'Secure',
    description: 'API Key authentication with rate limiting & IP whitelist'
  },
  {
    icon: Zap,
    title: 'Fast',
    description: 'Low latency, high throughput message delivery'
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'Real-time usage tracking and detailed logs'
  }
]

const pricing = [
  {
    name: 'Free',
    price: 'Rp0',
    credits: '100 credits/day',
    keys: '1 API key',
    rateLimit: '30 req/min',
    features: ['All endpoints', 'Basic support'],
    cta: 'Get Started',
    popular: false
  },
  {
    name: 'Premium',
    price: 'Rp25K',
    period: '/bulan',
    credits: '10K credits/day',
    keys: '5 API keys',
    rateLimit: '120 req/min',
    features: ['All endpoints', 'Priority support', 'IP whitelist'],
    cta: 'Upgrade Now',
    popular: true
  },
  {
    name: 'VIP',
    price: 'Rp50K',
    period: '/bulan',
    credits: '100K credits/day',
    keys: '20 API keys',
    rateLimit: '500 req/min',
    features: ['All endpoints', 'Priority support', 'IP whitelist', 'Custom limits'],
    cta: 'Contact Sales',
    popular: false
  }
]

const steps = [
  {
    num: '01',
    title: 'Generate API Key',
    description: 'Create your API key from the dashboard'
  },
  {
    num: '02',
    title: 'Add to Header',
    description: 'Include key in x-api-key header'
  },
  {
    num: '03',
    title: 'Send Message',
    description: 'POST to /api/send with platform & message'
  },
  {
    num: '04',
    title: 'Track Usage',
    description: 'Monitor credits & analytics in real-time'
  }
]

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            MessageAPI
          </div>
          <div className="flex gap-6">
            <Link href="/dashboard" className="hover:text-blue-400 transition">
              Dashboard
            </Link>
            <Link href="/docs" className="hover:text-blue-400 transition">
              Docs
            </Link>
            <Link href="/pricing" className="px-4 py-2 bg-blue-500 rounded-lg hover:bg-blue-600 transition">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
              Unified Messaging API
            </h1>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              One API for WhatsApp, Telegram & Discord. Simple, secure, and infinitely scalable.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link
                href="/dashboard"
                className="px-8 py-3 bg-blue-500 rounded-lg hover:bg-blue-600 transition flex items-center gap-2"
              >
                Start Free <ArrowRight size={20} />
              </Link>
              <Link
                href="/docs"
                className="px-8 py-3 bg-slate-700 rounded-lg hover:bg-slate-600 transition"
              >
                Read Docs
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            className="grid grid-cols-3 gap-8 mt-20 text-center"
          >
            <div>
              <div className="text-4xl font-bold text-blue-400">50+</div>
              <div className="text-slate-400">API Endpoints</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-purple-400">14K+</div>
              <div className="text-slate-400">Active Users</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-pink-400">38M+</div>
              <div className="text-slate-400">Requests/Month</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Why Choose Us?</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 bg-slate-700/50 rounded-lg border border-slate-600 hover:border-blue-400 transition"
              >
                <feature.icon size={32} className="text-blue-400 mb-4" />
                <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Simple Pricing</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {pricing.map((plan, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className={`p-8 rounded-lg border transition transform hover:scale-105 ${
                  plan.popular
                    ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-400 ring-2 ring-blue-400 scale-105'
                    : 'bg-slate-700/50 border-slate-600'
                }`}
              >
                {plan.popular && (
                  <div className="text-sm font-bold text-yellow-300 mb-4">MOST POPULAR</div>
                )}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-1">
                  {plan.price}
                  {plan.period && <span className="text-lg text-slate-300">{plan.period}</span>}
                </div>
                <p className="text-sm text-slate-400 mb-6">{plan.credits} &bull; {plan.keys} &bull; {plan.rateLimit}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, fIdx) => (
                    <li key={fIdx} className="flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={`w-full py-2 rounded-lg font-bold transition ${
                  plan.popular
                    ? 'bg-white text-blue-600 hover:bg-slate-100'
                    : 'bg-blue-500 hover:bg-blue-600'
                }`}>
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Getting Started */}
      <section className="py-20 px-4 bg-slate-800/50">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16">Get Started in 4 Steps</h2>
          <div className="grid md:grid-cols-4 gap-8">
            {steps.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center"
              >
                <div className="text-5xl font-bold text-blue-400 mb-4">{step.num}</div>
                <h3 className="text-lg font-bold mb-2">{step.title}</h3>
                <p className="text-slate-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to integrate?</h2>
          <p className="text-xl text-slate-300 mb-8">
            Start sending messages across all platforms with a single API call.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-bold hover:shadow-lg hover:shadow-blue-500/50 transition"
          >
            Get Your API Key Free →
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-12 px-4 text-center text-slate-400">
        <p>© 2026 MessageAPI. Built for developers. Proudly serving 14K+ users.</p>
      </footer>
    </div>
  )
}
