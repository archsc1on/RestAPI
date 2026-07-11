import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'MessageAPI'

export const metadata: Metadata = {
  title: `${siteName} - Unified Messaging & Tools API`,
  description: 'One API for messaging, downloads, tools, anime, and more. Simple, secure, scalable.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
