import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { prisma } from './db'

// Extend the built-in session types
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Add rate limiting for login attempts
        const loginAttempts = await prisma.loginAttempt.findMany({
          where: {
            email: credentials.email,
            createdAt: {
              gte: new Date(Date.now() - 15 * 60 * 1000) // Last 15 minutes
            }
          }
        })

        if (loginAttempts.length >= 5) {
          console.log('Too many login attempts for:', credentials.email)
          return null
        }

        const admin = await prisma.admin.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!admin) {
          // Record failed attempt
          await prisma.loginAttempt.create({
            data: {
              email: credentials.email,
              success: false,
              ipAddress: 'unknown' // We'd need to pass this from the request
            }
          })
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          admin.password
        )

        if (!isPasswordValid) {
          // Record failed attempt
          await prisma.loginAttempt.create({
            data: {
              email: credentials.email,
              success: false,
              ipAddress: 'unknown'
            }
          })
          return null
        }

        // Record successful attempt
        await prisma.loginAttempt.create({
          data: {
            email: credentials.email,
            success: true,
            ipAddress: 'unknown'
          }
        })

        return {
          id: admin.id,
          email: admin.email,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours (reduced from 30 days)
    updateAge: 60 * 60, // 1 hour
  },
  jwt: {
    maxAge: 8 * 60 * 60, // 8 hours
  },
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict', // Changed from 'lax' to 'strict'
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.jbinverters.com' : 'localhost'
      }
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.jbinverters.com' : 'localhost'
      }
    },
    csrfToken: {
      name: `next-auth.csrf-token`,
      options: {
        httpOnly: true,
        sameSite: 'strict',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.jbinverters.com' : 'localhost'
      }
    }
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login?error=SessionError',
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id
        token.iat = Math.floor(Date.now() / 1000)
      }
      
      // Refresh token if it's getting old
      if (Date.now() < (token.exp as number) * 1000 - 60 * 60 * 1000) {
        return token
      }
      
      return {
        ...token,
        exp: Math.floor(Date.now() / 1000) + (8 * 60 * 60) // 8 hours
      }
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Ensure redirects stay within the same origin
      if (url.startsWith('/')) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },
  events: {
    async signOut({ token }) {
      // Clean up any server-side session data if needed
      console.log('User signed out:', token?.email)
    }
  },
  debug: process.env.NODE_ENV === 'development'
}
