import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Crear respuesta de éxito
    const response = NextResponse.json({
      success: true,
      message: "Sesión cerrada exitosamente",
    })

    // Eliminar todas las cookies relacionadas con NextAuth
    const cookiesToDelete = [
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.session-token",
      "__Host-next-auth.csrf-token",
      "session",
    ]

    cookiesToDelete.forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      })
    })

    return response
  } catch (error) {
    console.error("Error during signout:", error)
    return NextResponse.json({ error: "Error al cerrar sesión" }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Crear respuesta de redirección
    const response = NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"))

    // Eliminar todas las cookies relacionadas con NextAuth
    const cookiesToDelete = [
      "next-auth.session-token",
      "next-auth.csrf-token",
      "next-auth.callback-url",
      "__Secure-next-auth.session-token",
      "__Host-next-auth.csrf-token",
      "session",
    ]

    cookiesToDelete.forEach((cookieName) => {
      response.cookies.set(cookieName, "", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 0,
        path: "/",
      })
    })

    return response
  } catch (error) {
    console.error("Error during signout:", error)
    return NextResponse.redirect(new URL("/", process.env.NEXTAUTH_URL || "http://localhost:3000"))
  }
}
