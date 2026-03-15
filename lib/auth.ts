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
        const username = credentials.username as string | undefined
        const password = credentials.password as string | undefined
        const storedHash = process.env.ADMIN_PASSWORD_HASH
        const storedUser = process.env.ADMIN_USERNAME

        console.log('[auth] authorize called')
        console.log('[auth] received username:', JSON.stringify(username))
        console.log('[auth] expected username:', JSON.stringify(storedUser))
        console.log('[auth] hash present:', !!storedHash, 'length:', storedHash?.length)

        if (!username || !password || !storedHash || !storedUser) {
          console.log('[auth] missing required fields')
          return null
        }

        const validUser = username === storedUser
        console.log('[auth] validUser:', validUser)

        const validPass = await bcrypt.compare(password, storedHash)
        console.log('[auth] validPass:', validPass)

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
