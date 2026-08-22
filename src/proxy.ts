import { withAuth } from "next-auth/middleware"
import type { NextRequest } from "next/server"

const authMiddleware = withAuth({
  pages: {
    signIn: "/admin/login",
  },
})

export function proxy(request: NextRequest) {
  return (authMiddleware as any)(request)
}

export const config = {
  matcher: ["/admin/((?!login).*)"],
}
