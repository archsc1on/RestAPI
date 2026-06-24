const stores = new Map<string, { count: number; resetAt: number }>()

export function checkIpRateLimit(ip: string, max: number = 30, windowMs: number = 60000): boolean {
  const now = Date.now()
  const key = `ip:${ip}`
  const entry = stores.get(key)

  if (!entry || now > entry.resetAt) {
    stores.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  entry.count++
  return entry.count <= max
}

export function checkOtpRateLimit(ip: string, max: number = 5, windowMs: number = 900000): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const key = `otp:${ip}`
  const entry = stores.get(key)

  if (!entry || now > entry.resetAt) {
    stores.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfter: 0 }
  }

  entry.count++
  if (entry.count > max) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  return { allowed: true, retryAfter: 0 }
}

export function checkBruteForce(identifier: string, max: number = 10, windowMs: number = 3600000): boolean {
  const now = Date.now()
  const key = `bf:${identifier}`
  const entry = stores.get(key)

  if (!entry || now > entry.resetAt) {
    stores.set(key, { count: 1, resetAt: now + windowMs })
    return true
  }

  entry.count++
  return entry.count <= max
}

setInterval(() => {
  const now = Date.now()
  const keys = Array.from(stores.keys())
  for (const key of keys) {
    const entry = stores.get(key)
    if (entry && now > entry.resetAt) stores.delete(key)
  }
}, 60000)
