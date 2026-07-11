import React from 'react'
import { cn } from '@/lib/utils'

interface DisplayProps {
  children: React.ReactNode
  className?: string
}

export function Display({ children, className }: DisplayProps) {
  return (
    <h1
      className={cn(
        'font-bold tracking-tight text-foreground',
        'text-4xl sm:text-5xl md:text-6xl lg:text-7xl',
        className
      )}
    >
      {children}
    </h1>
  )
}

interface HeadingProps {
  children: React.ReactNode
  level?: 2 | 3 | 4
  className?: string
}

const headingComponents = {
  2: 'h2',
  3: 'h3',
  4: 'h4',
} as const

export function Heading({ children, level = 2, className }: HeadingProps) {
  const Tag = headingComponents[level]
  const sizes = {
    2: 'text-2xl sm:text-3xl md:text-4xl',
    3: 'text-xl sm:text-2xl md:text-3xl',
    4: 'text-lg sm:text-xl md:text-2xl',
  }

  return (
    <Tag
      className={cn(
        'font-bold tracking-tight text-foreground',
        sizes[level],
        className
      )}
    >
      {children}
    </Tag>
  )
}

interface BodyProps {
  children: React.ReactNode
  variant?: 'default' | 'secondary' | 'muted'
  className?: string
}

export function Body({ children, variant = 'default', className }: BodyProps) {
  const variants = {
    default: 'text-foreground',
    secondary: 'text-foreground/80',
    muted: 'text-muted-foreground',
  }

  return (
    <p className={cn('text-base leading-relaxed', variants[variant], className)}>
      {children}
    </p>
  )
}

interface CodeProps {
  children: React.ReactNode
  className?: string
}

export function Code({ children, className }: CodeProps) {
  return (
    <code
      className={cn(
        'font-mono text-sm px-1.5 py-0.5 rounded-md',
        'bg-muted text-foreground/90',
        className
      )}
    >
      {children}
    </code>
  )
}
