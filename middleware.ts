import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Solo proteger rutas admin
  if (pathname.startsWith("/admin")) {
    try {
      const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
      })

      if (!token) {
        console.log("[MIDDLEWARE] No token found, redirecting to signin")
        const response = NextResponse.redirect(new URL("/auth/signin", request.url))

        // Limpiar cookies en caso de que existan cookies corruptas
        response.cookies.set("next-auth.session-token", "", { maxAge: 0, path: "/" })
        response.cookies.set("__Secure-next-auth.session-token", "", { maxAge: 0, path: "/" })

        return response
      }

      // Verificar roles específicos
      const userRole = token.role as string

      // Solo owners pueden acceder a configuración
      if (pathname.startsWith("/admin/settings") && userRole !== "owner") {
        return NextResponse.redirect(new URL("/admin/unauthorized", request.url))
      }

      // Solo owners y admins pueden gestionar usuarios
      if (pathname.startsWith("/admin/users") && !["owner", "admin"].includes(userRole)) {
        return NextResponse.redirect(new URL("/admin/unauthorized", request.url))
      }

      console.log("[MIDDLEWARE] Access granted for:", pathname, "role:", userRole)
    } catch (error) {
      console.error("[MIDDLEWARE] Error verifying token:", error)
      return NextResponse.redirect(new URL("/auth/signin", request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*"],
}
