import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { authConfig } from '../auth.config'

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        username: {},
        password: {},
      },
      async authorize(credentials) {
        const validUser = credentials.username === process.env.ADMIN_USERNAME
        const validPass = await bcrypt.compare(
          credentials.password as string,
          process.env.ADMIN_PASSWORD_HASH as string,
        )
        if (validUser && validPass) {
          return { id: '1', name: 'Admin', email: 'admin@lexplazo.app', role: 'admin' }
        }
        return null
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    jwt({ token, user }) {
      if (user) token.role = (user as { role?: string }).role
      return token
    },
    session({ session, token }) {
      if (session.user) (session.user as { role?: unknown }).role = token.role
      return session
    },
  },
})
