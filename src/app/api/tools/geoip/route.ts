import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'geoip', endpoint: '/api/tools/geoip', costCredits: 1 },
  async (req, { searchParams }) => {
    const ip = searchParams.get('ip')

    const url = ip
      ? `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,message,country,regionName,city,lat,lon,timezone,isp,org,as,mobile,proxy,hosting`
      : `http://ip-api.com/json/?fields=status,message,country,regionName,city,lat,lon,timezone,isp,org,as,mobile,proxy,hosting`

    const response = await fetch(url, { signal: AbortSignal.timeout(10000) })

    if (!response.ok) throw new Error('Failed to fetch geolocation data')

    const data = await response.json()

    if (data.status === 'fail') throw new Error(data.message || 'Lookup failed')

    return {
      ip: data.query || ip,
      country: data.country,
      region: data.regionName,
      city: data.city,
      coordinates: { lat: data.lat, lon: data.lon },
      timezone: data.timezone,
      isp: data.isp,
      org: data.org,
      as: data.as,
      mobile: data.mobile,
      proxy: data.proxy,
      hosting: data.hosting
    }
  }
)
