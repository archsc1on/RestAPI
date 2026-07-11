import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'phone-parse', endpoint: '/api/tools/phone-parse', costCredits: 1 },
  async (req, { searchParams }) => {
    const phone = searchParams.get('phone')
    if (!phone) throw new Error('phone is required')

    const cleaned = phone.replace(/[^0-9+]/g, '')
    const hasPlus = phone.startsWith('+')
    const digits = cleaned.replace(/\+/g, '')

    let countryCode = null
    let national = digits

    if (hasPlus && digits.length > 10) {
      countryCode = '+' + digits.substring(0, digits.length - 10)
      national = digits.substring(digits.length - 10)
    } else if (digits.length === 10) {
      national = digits
    }

    const formatted = countryCode ? `${countryCode}-${national.substring(0, 3)}-${national.substring(3, 6)}-${national.substring(6)}` : phone

    return { phone, cleaned, countryCode, national, formatted }
  }
)
