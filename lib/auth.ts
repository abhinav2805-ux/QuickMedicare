import { type NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { connectToDatabase } from '@/lib/mongodb'

function splitName(name?: string | null) {
  if (!name) {
    return { firstName: 'Google', lastName: 'User' }
  }

  const parts = name.trim().split(/\s+/)
  const firstName = parts[0] || 'Google'
  const lastName = parts.slice(1).join(' ') || 'User'

  return { firstName, lastName }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
  callbacks: {
    async signIn({ user }) {
      if (!user.email) {
        return false
      }

      const { db } = await connectToDatabase()
      const usersCollection = db.collection('users')

      const existingUser = await usersCollection.findOne({ email: user.email })
      if (!existingUser) {
        const { firstName, lastName } = splitName(user.name)

        await usersCollection.insertOne({
          email: user.email,
          password: '',
          firstName,
          lastName,
          phone: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      return true
    },
    async jwt({ token }) {
      if (!token.email) {
        return token
      }

      const { db } = await connectToDatabase()
      const usersCollection = db.collection('users')
      const appUser = await usersCollection.findOne({ email: token.email })

      if (appUser?._id) {
        token.sub = appUser._id.toString()
      }

      return token
    },
  },
}