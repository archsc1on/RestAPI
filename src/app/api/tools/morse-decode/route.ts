import { createPlugin } from '@/lib/plugin'

const MORSE_REV: Record<string, string> = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H',
  '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P',
  '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
  '-.--': 'Y', '--..': 'Z',
  '-----': '0', '.----': '1', '..---': '2', '...--': '3', '....-': '4', '.....': '5',
  '-....': '6', '--...': '7', '---..': '8', '----.': '9',
  '.-.-.-': '.', '--..--': ',', '..--..': '?', '-.-.--': '!', '/': ' '
}

export const GET = createPlugin(
  { name: 'morse-decode', endpoint: '/api/tools/morse-decode', costCredits: 1 },
  async (req, { searchParams }) => {
    const code = searchParams.get('code')
    if (!code) throw new Error('code is required')

    const decoded = code.trim().split(' ').map(c => MORSE_REV[c] || c).join('')
    return { morse: code, text: decoded }
  }
)
