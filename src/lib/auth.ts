// src/lib/auth.ts
import { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import GitHubProvider from 'next-auth/providers/github'
import { prisma } from './prisma'
import { generateOTP, verifyOTP, saveOTP, sendOTPEmail } from './otp'

export const authOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        otp: { label: 'OTP', type: 'text' },
        action: { label: 'Action', type: 'text' }
      },
      async authorize(credentials) {
        if (!credentials?.email) {
          throw new Error('Email required')
        }

        const email = credentials.email.toLowerCase()

        if (credentials.action === 'send-otp') {
          const otp = generateOTP()

          let user = await prisma.user.findUnique({ where: { email } })
          if (!user) {
            user = await prisma.user.create({
              data: {
                email,
                provider: 'email',
                name: email.split('@')[0],
                credits: 100
              }
            })
          }

          await saveOTP(user.id, otp)
          await sendOTPEmail(email, otp)

          return {
            id: 'otp-sent',
            email,
            role: 'USER'
          }
        }

        if (credentials.action === 'verify-otp') {
          if (!credentials.otp) {
            throw new Error('OTP required')
          }

          const isValid = await verifyOTP(email, credentials.otp)
          if (!isValid) {
            throw new Error('Invalid or expired OTP')
          }

          const user = await prisma.user.findUnique({ where: { email } })
          if (!user) {
            throw new Error('User not found')
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role
          }
        }

        throw new Error('Invalid action')
      }
    }),

    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
      async profile(profile) {
        const email = profile.email?.toLowerCase() || ''

        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.name,
              image: profile.picture,
              provider: 'google',
              providerId: profile.sub,
              emailVerified: true,
              credits: 100
            }
          })
        } else if (user.provider !== 'google') {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: 'google',
              providerId: profile.sub,
              image: profile.picture || user.image
            }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        }
      }
    }),

    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID || '',
      clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
      async profile(profile) {
        const email = profile.email?.toLowerCase() || `${profile.login}@github.com`

        let user = await prisma.user.findUnique({ where: { email } })

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              name: profile.name || profile.login,
              image: profile.avatar_url,
              provider: 'github',
              providerId: profile.id.toString(),
              emailVerified: !!profile.email,
              credits: 100
            }
          })
        } else if (user.provider !== 'github') {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              provider: 'github',
              providerId: profile.id.toString(),
              image: profile.avatar_url || user.image
            }
          })
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role
        }
      }
    })
  ],

  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.email = user.email
        token.role = (user as any).role || 'USER'
      }

      if (account) {
        token.provider = account.provider
      }

      if (token.id && !token.role) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { role: true }
        })
        if (dbUser) {
          token.role = dbUser.role
        }
      }

      return token
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.role = token.role as string
      }
      return session
    }
  },

  pages: {
    signIn: '/login',
    error: '/login'
  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60
  }
}
