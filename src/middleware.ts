// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname

  // Security headers
  const response = NextResponse.next()
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    )
  }

  // Public paths - no auth needed
  const publicPaths = ['/', '/login', '/register', '/docs', '/pricing']
  if (publicPaths.some(p => path === p || path.startsWith(p + '/'))) {
    // If logged in and on login page, redirect to dashboard
    if (token && (path === '/login' || path === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return response
  }

  // Public API routes
  if (path.startsWith('/api/auth') || path.startsWith('/api/health')) {
    return response
  }

  // API routes with API key auth (validated in route handler)
  if (path.startsWith('/api/send') || path.startsWith('/api/tools') || path.startsWith('/api/user')) {
    return response
  }

  // Admin routes - require ADMIN role
  if (path.startsWith('/admin')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    if (token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return response
  }

  // Protected routes - require session
  if (path.startsWith('/dashboard') || path.startsWith('/settings')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
    return response
  }

  return response
}

export const config = {
  matcher: [
    '/',
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/register',
    '/docs/:path*',
    '/pricing/:path*'
  ]
}
