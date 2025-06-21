import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { CRMService } from "@/app/services/crm-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { dealId: string } }) {
  try {
    console.log("🔥 GET notes for deal:", params.dealId)
    const notes = await CRMService.getDealNotes(params.dealId)

    return NextResponse.json({
      success: true,
      notes,
    })
  } catch (error) {
    console.error("❌ Error fetching deal notes:", error)
    return NextResponse.json({ success: false, error: "Error fetching notes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { dealId: string } }) {
  try {
    console.log("🔥 POST note for deal:", params.dealId)

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("❌ No session for note creation")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("🔥 Note request body:", JSON.stringify(body, null, 2))

    // Validar campos requeridos
    if (!body.content?.trim()) {
      console.log("❌ Missing note content")
      return NextResponse.json({ success: false, error: "El contenido es requerido" }, { status: 400 })
    }

    const note = await CRMService.addDealNote(params.dealId, body.content.trim(), session.user.id)

    console.log("✅ Note created successfully:", note.id)

    return NextResponse.json({
      success: true,
      note,
    })
  } catch (error) {
    console.error("❌ Error adding deal note:", error)
    return NextResponse.json({ success: false, error: "Error adding note" }, { status: 500 })
  }
}
