import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'coordinate-convert', endpoint: '/api/tools/coordinate-convert', costCredits: 1 },
  async (req, { searchParams }) => {
    const lat = parseFloat(searchParams.get('lat') || '')
    const lon = parseFloat(searchParams.get('lon') || '')
    if (isNaN(lat) || isNaN(lon)) throw new Error('lat and lon are required')

    const toDMS = (dec: number, isLat: boolean) => {
      const dir = dec >= 0 ? (isLat ? 'N' : 'E') : (isLat ? 'S' : 'W')
      const abs = Math.abs(dec)
      const d = Math.floor(abs)
      const mFloat = (abs - d) * 60
      const m = Math.floor(mFloat)
      const s = Math.round((mFloat - m) * 60 * 100) / 100
      return { degrees: d, minutes: m, seconds: s, direction: dir, dms: `${d}°${m}'${s}"${dir}` }
    }

    return { lat, lon, latitude: toDMS(lat, true), longitude: toDMS(lon, false) }
  }
)
