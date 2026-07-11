import { cn } from '@/lib/utils'

interface PageWrapperProps {
  children: React.ReactNode
  className?: string
  noPadding?: boolean
}

export function PageWrapper({ children, className, noPadding }: PageWrapperProps) {
  return (
    <main
      className={cn(
        'min-h-screen',
        !noPadding && 'pt-16',
        className
      )}
    >
      {children}
    </main>
  )
}
