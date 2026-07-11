import { createPlugin } from '@/lib/plugin'
import tls from 'tls'

export const GET = createPlugin(
  { name: 'ssl-check', endpoint: '/api/tools/ssl-check', costCredits: 1 },
  async (req, { searchParams }) => {
    const domain = searchParams.get('domain')

    if (!domain) throw new Error('domain parameter required')

    const info = await new Promise<any>((resolve, reject) => {
      const socket = tls.connect(443, domain, { servername: domain, rejectUnauthorized: false }, () => {
        const cert = socket.getPeerCertificate()
        socket.end()
        if (!cert || !cert.subject) {
          reject(new Error('No certificate found'))
        } else {
          resolve(cert)
        }
      })
      socket.on('error', reject)
      socket.setTimeout(10000, () => {
        socket.destroy()
        reject(new Error('Connection timeout'))
      })
    })

    return {
      domain,
      subject: info.subject?.CN || domain,
      issuer: info.issuer?.O || 'Unknown',
      serialNumber: info.serialNumber,
      validFrom: info.valid_from,
      validTo: info.valid_to,
      valid: new Date(info.valid_to) > new Date(),
      daysLeft: Math.floor((new Date(info.valid_to).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    }
  }
)
