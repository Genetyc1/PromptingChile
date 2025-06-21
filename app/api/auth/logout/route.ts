import { type NextRequest, NextResponse } from "next/server"
import { deleteSession } from "@/app/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("session-id")?.value

    if (sessionId) {
      deleteSession(sessionId)
    }

    const response = NextResponse.json({ success: true })

    // Eliminar la cookie
    response.cookies.set("session-id", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 0,
      path: "/",
    })

    return response
  } catch (error) {
    console.error("Logout error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
