import { createPlugin } from '@/lib/plugin'
import crypto from 'crypto'

export const GET = createPlugin(
  { name: 'hash', endpoint: '/api/tools/hash', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    const algorithm = searchParams.get('algo') || 'md5'

    if (!text) throw new Error('text parameter required')

    const algos: Record<string, string> = {
      md5: 'md5',
      sha1: 'sha1',
      sha256: 'sha256',
      sha512: 'sha512'
    }

    const algo = algos[algorithm.toLowerCase()]
    if (!algo) throw new Error(`Unsupported algorithm. Use: ${Object.keys(algos).join(', ')}`)

    const hash = crypto.createHash(algo).update(text).digest('hex')

    return {
      input: text.substring(0, 100),
      algorithm: algo,
      hash
    }
  }
)
