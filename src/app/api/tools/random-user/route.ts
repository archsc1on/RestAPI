import { createPlugin } from '@/lib/plugin'

async function fetchWithRetry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try { return await fn() } catch (e) {
      if (i === retries - 1) throw e
      await new Promise(r => setTimeout(r, delay * (i + 1)))
    }
  }
  throw new Error('Max retries exceeded')
}

const FAKE_NAMES = ['John Smith', 'Jane Doe', 'Alex Johnson', 'Maria Garcia', 'Wei Zhang', 'Pierre Dupont', 'Yuki Tanaka', 'Ahmed Hassan', 'Sofia Rodriguez', 'Liam O\'Brien']

function generateFakeUser() {
  const name = FAKE_NAMES[Math.floor(Math.random() * FAKE_NAMES.length)]
  const [first, last] = name.split(' ')
  return {
    gender: Math.random() > 0.5 ? 'male' : 'female',
    name: { title: 'Mr.', first, last },
    email: `${first.toLowerCase()}.${last.toLowerCase()}@example.com`,
    phone: `+1-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    cell: `+1-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
    location: { city: 'New York', state: 'NY', country: 'United States', postcode: '10001' },
    age: Math.floor(18 + Math.random() * 50),
    dateOfBirth: new Date(Date.now() - Math.floor(18 + Math.random() * 50) * 365.25 * 86400000).toISOString(),
    picture: { large: '', medium: '', thumbnail: '' },
    nationality: 'US'
  }
}

export const GET = createPlugin(
  { name: 'random-user', endpoint: '/api/tools/random-user', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 10)
    const gender = searchParams.get('gender') || ''
    const nat = searchParams.get('nat') || ''

    let url = `https://randomuser.me/api/?results=${count}`
    if (gender) url += `&gender=${gender}`
    if (nat) url += `&nat=${nat}`

    try {
      const data = await fetchWithRetry(async () => {
        const response = await fetch(url, { signal: AbortSignal.timeout(10000) })
        if (!response.ok) throw new Error('Failed to fetch random users')
        return response.json()
      })
      const users = (data.results || []).map((u: any) => ({
        gender: u.gender,
        name: { title: u.name.title, first: u.name.first, last: u.name.last },
        email: u.email,
        phone: u.phone,
        cell: u.cell,
        location: {
          city: u.location.city,
          state: u.location.state,
          country: u.location.country,
          postcode: u.location.postcode
        },
        age: u.dob.age,
        dateOfBirth: u.dob.date,
        picture: { large: u.picture.large, medium: u.picture.medium, thumbnail: u.picture.thumbnail },
        nationality: u.nat
      }))
      return { count: users.length, results: users }
    } catch {
      const users = Array.from({ length: count }, () => generateFakeUser())
      return { count: users.length, results: users, note: 'randomuser.me API unavailable, using generated data' }
    }
  }
)
