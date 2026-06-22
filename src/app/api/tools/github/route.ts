// src/app/api/tools/github/route.ts
import { createPlugin } from '@/lib/plugin'

export const GET = createPlugin(
  { name: 'github', endpoint: '/api/tools/github', costCredits: 1 },
  async (req, { searchParams }) => {
    const user = searchParams.get('user')

    if (!user) throw new Error('user parameter required')

    const response = await fetch(`https://api.github.com/users/${encodeURIComponent(user)}`)

    if (!response.ok) {
      throw new Error('User not found')
    }

    const data = await response.json()

    return {
      username: data.login,
      name: data.name || data.login,
      bio: data.bio || '',
      avatar: data.avatar_url,
      profile: data.html_url,
      repos: data.public_repos,
      followers: data.followers,
      following: data.following,
      location: data.location || '',
      company: data.company || '',
      blog: data.blog || '',
      created: data.created_at
    }
  }
)
