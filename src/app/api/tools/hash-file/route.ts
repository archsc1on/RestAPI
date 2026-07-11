import { createPlugin } from '@/lib/plugin'
import crypto from 'crypto'

export const GET = createPlugin(
  { name: 'hash-file', endpoint: '/api/tools/hash-file', costCredits: 1 },
  async (req, { searchParams }) => {
    const text = searchParams.get('text')
    const algorithms = (searchParams.get('algorithms') || 'md5,sha256').split(',')

    if (!text) throw new Error('text parameter required')

    const supported: Record<string, string> = {
      md5: 'md5', sha1: 'sha1', sha256: 'sha256', sha384: 'sha384', sha512: 'sha512'
    }

    const hashes: Record<string, string> = {}
    for (const algo of algorithms) {
      const trimmed = algo.trim().toLowerCase()
      if (supported[trimmed]) {
        hashes[trimmed] = crypto.createHash(supported[trimmed]).update(text).digest('hex')
      }
    }

    return {
      input: text.substring(0, 100),
      hashes
    }
  }
)
