import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { checkIpRateLimit } from '@/lib/security'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const path = req.nextUrl.pathname
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || '127.0.0.1'

  const response = NextResponse.next()

  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=(), usb=(), magnetometer=()')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-DNS-Prefetch-Control', 'off')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none')

  if (process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.cobalt.tools https://api.jikan.moe https://*.googleapis.com; frame-ancestors 'none';"
    )
  }

  if (!checkIpRateLimit(ip, 200, 60000)) {
    return NextResponse.json(
      { status: false, message: 'Too many requests from this IP' },
      { status: 429 }
    )
  }

  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentLength = req.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1048576) {
      return NextResponse.json(
        { status: false, message: 'Request body too large (max 1MB)' },
        { status: 413 }
      )
    }
  }

  if (req.method === 'POST' && path.startsWith('/api/tools') && !path.includes('send')) {
    return NextResponse.json(
      { status: false, message: 'Use GET for tool endpoints' },
      { status: 405 }
    )
  }

  if (path === '/api/auth/otp' && req.method === 'POST') {
    const { checkOtpRateLimit } = await import('@/lib/security')
    const { allowed, retryAfter } = checkOtpRateLimit(ip, 5, 900000)
    if (!allowed) {
      return NextResponse.json(
        { status: false, message: `Too many OTP requests. Try again in ${retryAfter}s` },
        { status: 429 }
      )
    }
  }

  const publicPaths = ['/', '/login', '/register', '/docs', '/pricing']
  if (publicPaths.some(p => path === p || path.startsWith(p + '/'))) {
    if (token && (path === '/login' || path === '/register')) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return response
  }

  if (path.startsWith('/api/auth') || path.startsWith('/api/health')) {
    return response
  }

  if (path.startsWith('/api/send') || path.startsWith('/api/tools') || path.startsWith('/api/user')) {
    return response
  }

  if (path.startsWith('/admin')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
    if (token.role !== 'ADMIN') return NextResponse.redirect(new URL('/dashboard', req.url))
    return response
  }

  if (path.startsWith('/dashboard') || path.startsWith('/settings')) {
    if (!token) return NextResponse.redirect(new URL('/login', req.url))
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
    '/pricing/:path*',
    '/api/:path*'
  ]
}
