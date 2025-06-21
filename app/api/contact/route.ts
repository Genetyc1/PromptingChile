import { type NextRequest, NextResponse } from "next/server"
import { sendContactEmail } from "@/app/actions/contact"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest) {
  try {
    console.log("📧 API Contact - Recibiendo solicitud...")

    const body = await request.json()
    console.log("📧 API Contact - Datos recibidos:", body)

    // Crear FormData para la Server Action
    const formData = new FormData()
    formData.append("firstName", body.firstName || "")
    formData.append("lastName", body.lastName || "")
    formData.append("email", body.email || "")
    formData.append("message", body.message || "")

    // Llamar a la Server Action
    const result = await sendContactEmail(formData)

    console.log("📧 API Contact - Resultado:", result)

    return NextResponse.json(result)
  } catch (error) {
    console.error("❌ API Contact - Error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Error interno del servidor",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
