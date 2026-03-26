import type { NextAuthConfig } from "next-auth"

// This config is edge-safe (no DB imports) — used by middleware for JWT verification only
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user
      const isAuthRoute =
        nextUrl.pathname.startsWith("/login") ||
        nextUrl.pathname.startsWith("/api/auth")

      if (isAuthRoute) {
        if (isLoggedIn) return Response.redirect(new URL("/", nextUrl))
        return true
      }

      if (!isLoggedIn) return false
      return true
    },
  },
  providers: [], // providers added in lib/auth.ts
}
