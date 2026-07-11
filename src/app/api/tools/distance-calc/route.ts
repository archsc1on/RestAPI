import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'distance-calc', endpoint: '/api/tools/distance-calc', costCredits: 1 },
  async (req, { searchParams }) => {
    const lat1 = parseFloat(searchParams.get('lat1') || '')
    const lon1 = parseFloat(searchParams.get('lon1') || '')
    const lat2 = parseFloat(searchParams.get('lat2') || '')
    const lon2 = parseFloat(searchParams.get('lon2') || '')
    if (isNaN(lat1) || isNaN(lon1) || isNaN(lat2) || isNaN(lon2)) throw new Error('lat1, lon1, lat2, lon2 are required')

    const R = 6371
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const km = R * c
    const miles = km * 0.621371

    return { lat1, lon1, lat2, lon2, km: Math.round(km * 100) / 100, miles: Math.round(miles * 100) / 100 }
  }
)
