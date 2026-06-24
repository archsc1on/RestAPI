'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { CheckCircle, ArrowRight, LogOut } from 'lucide-react'

const plans = [
  {
    name: 'Free',
    price: 'Rp0',
    credits: '100 credits/day',
    keys: '1 API key',
    rateLimit: '30 req/min',
    features: ['All API endpoints', '1 API key', '100 credits/day (resets daily)', 'Basic support'],
    cta: 'Get Started Free',
    popular: false
  },
  {
    name: 'Premium',
    price: 'Rp25K',
    period: '/bulan',
    credits: '10,000 credits/day',
    keys: '5 API keys',
    rateLimit: '120 req/min',
    features: ['All API endpoints', '5 API keys', '10,000 credits/day', 'IP whitelist', 'Priority support'],
    cta: 'Upgrade Now',
    popular: true
  },
  {
    name: 'VIP',
    price: 'Rp50K',
    period: '/bulan',
    credits: '100,000 credits/day',
    keys: '20 API keys',
    rateLimit: '500 req/min',
    features: ['All API endpoints', '20 API keys', '100,000 credits/day', 'IP whitelist', 'Custom limits', 'Priority support'],
    cta: 'Contact Sales',
    popular: false
  }
]

export default function PricingPage() {
  const { data: session } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Navigation - same as dashboard */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Pricing
          </div>
          <div className="flex items-center gap-6">
            <a href="/" className="hover:text-blue-400 transition">Home</a>
            <a href="/docs" className="hover:text-blue-400 transition">Docs</a>
            <a href="/dashboard" className="hover:text-blue-400 transition">Dashboard</a>
            {session?.user && (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-600">
                <div className="text-right">
                  <div className="text-sm font-medium">{session.user.name || session.user.email}</div>
                </div>
                <button onClick={() => signOut({ callbackUrl: '/login' })} className="p-2 hover:bg-slate-700 rounded transition">
                  <LogOut size={18} />
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-3">Simple, Transparent Pricing</h1>
          <p className="text-lg text-slate-400">Credits reset daily. Pay only for what you need.</p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
          {plans.map((plan, idx) => (
            <div key={idx} className={`relative p-6 rounded-xl border transition transform hover:scale-105 ${
              plan.popular
                ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-400 ring-2 ring-blue-400 scale-105'
                : 'bg-slate-700/50 border-slate-600'
            }`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-yellow-500 text-black text-xs font-bold rounded-full">
                  MOST POPULAR
                </div>
              )}
              <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="text-3xl font-bold">{plan.price}</span>
                {plan.period && <span className="text-slate-300 text-sm">{plan.period}</span>}
              </div>
              <div className="text-xs text-slate-400 mb-6">{plan.credits} &bull; {plan.keys} &bull; {plan.rateLimit}</div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <CheckCircle size={14} className="text-green-400 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/login" className={`block w-full py-2.5 rounded-lg font-bold text-center text-sm transition ${
                plan.popular ? 'bg-white text-blue-600 hover:bg-slate-100' : 'bg-blue-500 hover:bg-blue-600'
              }`}>
                {plan.cta} <ArrowRight size={14} className="inline ml-1" />
              </Link>
            </div>
          ))}
        </div>

        {/* Credit Costs */}
        <div className="bg-slate-700/50 rounded-xl border border-slate-600 p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Credit Costs</h2>

          <h3 className="text-sm font-bold text-green-400 mb-2">Text Tools (1 cr)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {['Text to MP3', 'Word Count', 'Base64', 'Slugify', 'Reverse Text', 'Lorem Ipsum', 'Hash Generator', 'Password Gen', 'Translate', 'QR Code', 'Short URL', 'TTS'].map((name) => (
              <div key={name} className="bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-green-400">1 cr</div>
                <div className="text-xs text-slate-400">{name}</div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-pink-400 mb-2">Image Tools (1 cr)</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
            {['Placeholder', 'Avatar', 'Color Info'].map((name) => (
              <div key={name} className="bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-pink-400">1 cr</div>
                <div className="text-xs text-slate-400">{name}</div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-red-400 mb-2">Downloader (3 cr)</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            {['YouTube DL', 'Instagram DL', 'TikTok DL', 'Twitter/X DL', 'Facebook DL'].map((name) => (
              <div key={name} className="bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-red-400">3 cr</div>
                <div className="text-xs text-slate-400">{name}</div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-purple-400 mb-2">Anime (2 cr)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {['Anime Search', 'Anime Detail', 'Manga Search', 'Character Search', 'Anime Schedule', 'Waifu'].map((name) => (
              <div key={name} className="bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-purple-400">{name === 'Waifu' ? '1' : '2'} cr</div>
                <div className="text-xs text-slate-400">{name}</div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-cyan-400 mb-2">Information (1-2 cr)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
            {['IP Lookup', 'Weather', 'News', 'Dictionary', 'KBBI', 'Currency', 'Timezone', 'Crypto', 'Country', 'Air Quality', 'NASA Space', 'COVID'].map((name) => (
              <div key={name} className="bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-cyan-400">{name === 'News' ? '2' : '1'} cr</div>
                <div className="text-xs text-slate-400">{name}</div>
              </div>
            ))}
          </div>

          <h3 className="text-sm font-bold text-orange-400 mb-2">Data & Fun (1-2 cr)</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['GitHub Profile', 'GitHub Repos', 'NPM Search', 'Random User', 'Random Facts', 'Trivia', 'Jokes', 'Dad Joke', 'Quotes', 'Random Cat', 'Random Dog', 'Meme', 'Recipe', 'Movie', 'Book', 'Steam Game'].map((name) => (
              <div key={name} className="bg-slate-800 rounded-lg p-3 text-center">
                <div className="text-sm font-bold text-orange-400">1 cr</div>
                <div className="text-xs text-slate-400">{name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="bg-slate-700/50 rounded-xl border border-slate-600 p-6">
          <h2 className="text-xl font-bold mb-4">FAQ</h2>
          <div className="space-y-4">
            {[
              { q: 'What are credits?', a: 'Credits are consumed per API call. Each endpoint costs 1-2 credits. Credits reset daily at midnight.' },
              { q: 'Do credits expire?', a: 'Credits reset to your tier limit every day. Unused credits do not carry over.' },
              { q: 'Can I upgrade later?', a: 'Yes! Upgrade anytime from the dashboard. Changes take effect immediately.' }
            ].map((faq, i) => (
              <div key={i} className="bg-slate-800/50 rounded-lg p-4 border border-slate-600/50">
                <h3 className="font-bold text-sm mb-1">{faq.q}</h3>
                <p className="text-slate-400 text-xs">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
