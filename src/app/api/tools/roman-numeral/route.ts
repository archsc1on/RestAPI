import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'roman-numeral', endpoint: '/api/tools/roman-numeral', costCredits: 1 },
  async (req, { searchParams }) => {
    const number = parseInt(searchParams.get('number') || '')

    if (isNaN(number) || number < 1 || number > 3999) {
      throw new Error('number parameter required (1-3999)')
    }

    const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1]
    const numerals = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I']

    let result = ''
    let remaining = number

    for (let i = 0; i < values.length; i++) {
      while (remaining >= values[i]) {
        result += numerals[i]
        remaining -= values[i]
      }
    }

    return { number, roman: result }
  }
)
