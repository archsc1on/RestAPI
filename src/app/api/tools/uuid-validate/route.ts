import { createPlugin } from '@/lib/plugin'
import crypto from 'crypto'

export const GET = createPlugin(
  { name: 'uuid-validate', endpoint: '/api/tools/uuid-validate', costCredits: 1 },
  async (req, { searchParams }) => {
    const uuid = searchParams.get('uuid')

    if (!uuid) throw new Error('uuid parameter required')

    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    const isValid = uuidRegex.test(uuid)

    const version = isValid ? uuid[14] : null
    const variant = isValid ? (parseInt(uuid[19], 16) & 0xc) === 8 ? 'RFC 4122' : 'Other' : null

    return {
      uuid,
      isValid,
      version: version ? parseInt(version) : null,
      variant
    }
  }
)
