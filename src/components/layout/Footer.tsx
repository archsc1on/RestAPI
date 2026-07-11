import Link from 'next/link'
import { Zap } from 'lucide-react'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'MessageAPI'

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-foreground">
            <div className="flex items-center justify-center w-7 h-7 rounded-md bg-primary/10">
              <Zap className="w-3.5 h-3.5 text-primary" />
            </div>
            {siteName}
          </Link>
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
