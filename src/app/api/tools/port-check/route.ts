import { createPlugin } from '@/lib/plugin'
import net from 'net'

export const GET = createPlugin(
  { name: 'port-check', endpoint: '/api/tools/port-check', costCredits: 1 },
  async (req, { searchParams }) => {
    const host = searchParams.get('host')
    const port = parseInt(searchParams.get('port') || '')

    if (!host) throw new Error('host parameter required')
    if (!port || isNaN(port) || port < 1 || port > 65535) throw new Error('Valid port parameter required (1-65535)')

    const isOpen = await new Promise<boolean>((resolve) => {
      const socket = new net.Socket()
      const timeout = 5000

      socket.setTimeout(timeout)
      socket.on('connect', () => {
        socket.destroy()
        resolve(true)
      })
      socket.on('timeout', () => {
        socket.destroy()
        resolve(false)
      })
      socket.on('error', () => {
        socket.destroy()
        resolve(false)
      })
      socket.connect(port, host)
    })

    return {
      host,
      port,
      open: isOpen,
      status: isOpen ? 'open' : 'closed/filtered'
    }
  }
)
