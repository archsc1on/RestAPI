import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'email-validate', endpoint: '/api/tools/email-validate', costCredits: 1 },
  async (req, { searchParams }) => {
    const email = searchParams.get('email')

    if (!email) throw new Error('email parameter required')

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    const formatValid = emailRegex.test(email)

    const domain = email.split('@')[1]
    let mxExists = false

    try {
      const response = await fetch(
        `https://dns.google/resolve?name=${encodeURIComponent(domain)}&type=MX`,
        { signal: AbortSignal.timeout(5000) }
      )
      if (response.ok) {
        const data = await response.json()
        mxExists = (data.Answer?.length || 0) > 0
      }
    } catch {}

    return {
      email,
      formatValid,
      domain,
      mxExists,
      isValid: formatValid && mxExists
    }
  }
)
