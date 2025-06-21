import { NextResponse } from "next/server"
import { getCurrentUser } from "@/app/lib/auth"

export async function GET() {
  try {
    const user = await getCurrentUser()
    return user ? NextResponse.json({ user }) : NextResponse.json({ error: "No autenticado" }, { status: 401 })
  } catch (error) {
    return NextResponse.json({ error: "Error del servidor" }, { status: 500 })
  }
}
