'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Zap } from 'lucide-react'
import { BrandPanel } from '@/components/login/BrandPanel'
import { LoginForm } from '@/components/login/LoginForm'
import { ThemeToggle } from '@/components/ThemeProvider'
import { FloatingBackground } from '@/components/FloatingBackground'
import { tokens } from '@/app/lib/tokens'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex relative">
      <FloatingBackground />
      <BrandPanel />

      <div className="flex-1 flex flex-col">
        <div className="flex items-center justify-between p-6">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-foreground lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            MessageAPI
          </Link>
          <Link href="/" className="hidden lg:flex items-center gap-2 font-bold text-lg text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Zap className="w-4 h-4 text-primary" />
            </div>
            MessageAPI
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex-1 flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: tokens.motion.easeOut }}
            className="w-full max-w-sm"
          >
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
              <p className="text-muted-foreground mt-1">
                Sign in to your account
              </p>
            </div>

            <LoginForm />

            <p className="text-center text-xs text-muted-foreground mt-6">
              First time here? Your account will be created automatically.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
