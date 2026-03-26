// Temporarily disabled auth middleware for testing
// import NextAuth from "next-auth"
// import { authConfig } from "./auth.config"

// export default NextAuth(authConfig).auth

// export const config = {
//   matcher: [
//     // Protect everything except static files and images
//     "/((?!_next/static|_next/image|favicon.ico|icon.*|apple-icon.*|.*\\.png|.*\\.svg|.*\\.ico).*)",
//   ],
// }

export default function middleware() {
  // Auth disabled for testing
}
