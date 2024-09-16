import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { compare } from 'bcryptjs'
import { getUserByEmail } from '@/utils/auth'
import dbConnect from '@/lib/mongodb'
export const dynamic = 'force-dynamic';

// Make sure to set this in your environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        await dbConnect()
        
        const user = await getUserByEmail(credentials.email)
        
        if (!user) {
          return null
        }

        const isPasswordValid = await compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        // Extend the token with user information
        token.id = user.id
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async session({ session, token }) {
      // Add user information to the session
      session.user = {
        id: token.id as string,
        email: token.email as string,
        name: token.name as string
      }
      return session
    }
  },
  pages: {
    signIn: '/',
  },
  // Use JWT_SECRET for NextAuth secret
  secret: JWT_SECRET,
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }