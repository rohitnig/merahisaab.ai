import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from './prisma'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'phone',
      credentials: {
        phone: { label: 'Phone Number', type: 'tel', placeholder: '+91XXXXXXXXXX' },
        otp: { label: 'OTP', type: 'text', placeholder: 'Enter OTP' }
      },
      async authorize(credentials) {
        if (!credentials?.phone) {
          return null
        }

        // For now, we'll create a basic auth without OTP
        // In production, implement proper OTP verification
        try {
          const storeOwner = await prisma.storeOwner.upsert({
            where: { email: `${credentials.phone}@phone.local` },
            update: { phone: credentials.phone },
            create: {
              email: `${credentials.phone}@phone.local`,
              phone: credentials.phone,
              ownerName: 'Store Owner',
              storeName: 'My Store'
            }
          })

          return {
            id: storeOwner.id,
            email: storeOwner.email,
            name: storeOwner.ownerName || 'Store Owner',
            phone: storeOwner.phone || ''
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.phone = (user as any).phone
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.phone = token.phone as string
      }
      return session
    }
  },
  pages: {
    signIn: '/auth/signin'
  },
  session: {
    strategy: 'jwt'
  }
}