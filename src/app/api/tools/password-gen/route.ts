import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'password-gen', endpoint: '/api/tools/password-gen', costCredits: 1 },
  async (req, { searchParams }) => {
    const length = Math.min(Math.max(parseInt(searchParams.get('length') || '16'), 4), 128)
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 10)
    const uppercase = searchParams.get('uppercase') !== 'false'
    const lowercase = searchParams.get('lowercase') !== 'false'
    const numbers = searchParams.get('numbers') !== 'false'
    const symbols = searchParams.get('symbols') !== 'false'

    let chars = ''
    if (uppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    if (lowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
    if (numbers) chars += '0123456789'
    if (symbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

    if (!chars) chars = 'abcdefghijklmnopqrstuvwxyz'

    const passwords: string[] = []
    for (let i = 0; i < count; i++) {
      let pw = ''
      const arr = new Uint32Array(length)
      crypto.getRandomValues(arr)
      for (let j = 0; j < length; j++) {
        pw += chars[arr[j] % chars.length]
      }
      passwords.push(pw)
    }

    return {
      passwords,
      length,
      options: { uppercase, lowercase, numbers, symbols }
    }
  }
)
