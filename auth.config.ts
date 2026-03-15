import type { NextAuthConfig } from 'next-auth'

// Edge-compatible config (no Node.js-only dependencies like bcryptjs)
// Used by middleware.ts for route protection.
// The full auth.ts adds the Credentials provider with bcrypt.
export const authConfig = {
  pages: { signIn: '/admin/login' },
  providers: [],
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isLoginPage = nextUrl.pathname.startsWith('/admin/login')
      const isAdminPath = nextUrl.pathname.startsWith('/admin')
      if (isAdminPath && !isLoginPage && !isLoggedIn) return false
      return true
    },
  },
} satisfies NextAuthConfig
