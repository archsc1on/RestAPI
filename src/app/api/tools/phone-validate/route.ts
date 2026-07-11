import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'phone-validate', endpoint: '/api/tools/phone-validate', costCredits: 1 },
  async (req, { searchParams }) => {
    const phone = searchParams.get('phone')

    if (!phone) throw new Error('phone parameter required')

    const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')
    const hasPlus = cleaned.startsWith('+')
    const digitsOnly = cleaned.replace(/\+/g, '')
    const isValidFormat = /^\d{7,15}$/.test(digitsOnly)

    const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{1,4}[-\s\.]?[0-9]{1,9}$/
    const validStructure = phoneRegex.test(phone)

    return {
      input: phone,
      cleaned,
      validFormat: isValidFormat,
      validStructure,
      isValid: isValidFormat && validStructure,
      digitsOnly,
      countryCode: hasPlus ? `+${digitsOnly.substring(0, Math.min(3, digitsOnly.length))}` : null,
      length: digitsOnly.length
    }
  }
)
