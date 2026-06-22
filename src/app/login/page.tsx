'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, GitBranch, Globe, ArrowRight } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'email' | 'otp'>('email')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        action: 'send-otp',
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else {
        setStep('otp')
      }
    } catch (err) {
      setError('Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        otp,
        action: 'verify-otp',
        redirect: false
      })

      if (result?.error) {
        setError(result.error)
      } else if (result?.ok) {
        router.push('/dashboard')
      }
    } catch (err) {
      setError('Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-2">
            MessageAPI
          </h1>
          <p className="text-slate-400">Sign in to your account</p>
        </div>

        {/* Main Card */}
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-8 backdrop-blur">
          {step === 'email' ? (
            <>
              {/* Email Form */}
              <form onSubmit={handleSendOTP} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-600/20 border border-red-600/50 rounded text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={!email || loading}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Sending...' : <>Send OTP <ArrowRight size={16} /></>}
                </button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-slate-800 text-slate-400">Or continue with</span>
                </div>
              </div>

              {/* OAuth Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() =>
                    signIn('google', {
                      redirect: false,
                      callbackUrl: '/dashboard'
                    })
                  }
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <Globe size={18} /> Google
                </button>

                <button
                  onClick={() =>
                    signIn('github', {
                      redirect: false,
                      callbackUrl: '/dashboard'
                    })
                  }
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg font-medium transition flex items-center justify-center gap-2"
                >
                  <GitBranch size={18} /> GitHub
                </button>
              </div>
            </>
          ) : (
            <>
              {/* OTP Form */}
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <div className="text-center mb-6">
                  <p className="text-slate-400 text-sm">
                    We sent a 6-digit code to
                  </p>
                  <p className="font-mono text-blue-400">{email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Enter Code
                  </label>
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 transition font-mono text-lg tracking-widest text-center"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-red-600/20 border border-red-600/50 rounded text-red-400 text-sm">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={otp.length !== 6 || loading}
                  className="w-full py-2 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-lg font-bold transition flex items-center justify-center gap-2"
                >
                  {loading ? 'Verifying...' : <>Verify <ArrowRight size={16} /></>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setStep('email')
                    setOtp('')
                    setError('')
                  }}
                  className="w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition text-sm"
                >
                  Back to Email
                </button>
              </form>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-slate-400 text-sm">
          <p>First time here? Your account will be created automatically.</p>
        </div>
      </div>
    </div>
  )
}
