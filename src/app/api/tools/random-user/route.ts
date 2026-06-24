import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'random-user', endpoint: '/api/tools/random-user', costCredits: 1 },
  async (req, { searchParams }) => {
    const count = Math.min(parseInt(searchParams.get('count') || '1'), 10)
    const gender = searchParams.get('gender') || ''
    const nat = searchParams.get('nat') || ''

    let url = `https://randomuser.me/api/?results=${count}`
    if (gender) url += `&gender=${gender}`
    if (nat) url += `&nat=${nat}`

    const response = await fetch(url)
    if (!response.ok) throw new Error('Failed to fetch random users')

    const data = await response.json()
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
  }
)
