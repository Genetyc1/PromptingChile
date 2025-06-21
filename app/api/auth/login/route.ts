import { type NextRequest, NextResponse } from "next/server"
import { authenticateUser, createSession } from "@/app/lib/auth"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const user = await authenticateUser(email, password)

    if (!user) {
      return NextResponse.json({ error: "Credenciales inválidas" }, { status: 401 })
    }

    await createSession(user)
    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
