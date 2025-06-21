import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { CRMService } from "@/app/services/crm-service"
import type { DealStatus } from "@/app/types/crm"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const statusParams = searchParams.getAll("status")
    const showArchived = searchParams.get("show_archived") === "true"

    const status = statusParams.length > 0 ? (statusParams as DealStatus[]) : undefined

    const deals = await CRMService.getDeals({
      search,
      status,
      show_archived: showArchived,
    })

    return NextResponse.json({
      success: true,
      deals,
      count: deals.length,
    })
  } catch (error) {
    console.error("Error in CRM deals API:", error)
    return NextResponse.json({ success: false, error: "Error fetching deals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔥 POST /api/admin/crm/deals - Starting request")

    const session = await getServerSession(authOptions)
    console.log("🔥 Session:", session?.user?.id, session?.user?.role)

    if (!session?.user?.id) {
      console.log("❌ No session found")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role as string
    if (!["admin", "owner"].includes(userRole)) {
      console.log("❌ Insufficient permissions:", userRole)
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    console.log("🔥 Request body:", JSON.stringify(body, null, 2))

    // Validar campos requeridos
    if (!body.title?.trim()) {
      console.log("❌ Missing title")
      return NextResponse.json({ success: false, error: "El título es requerido" }, { status: 400 })
    }

    const dealData = {
      title: body.title.trim(),
      organization: body.organization?.trim() || null,
      contact_name: body.contact_name?.trim() || null,
      contact_email: body.contact_email?.trim() || null,
      contact_phone: body.contact_phone?.trim() || null,
      value: body.value ? Number(body.value) : 0,
      status: (body.status as DealStatus) || "Prospección General",
      quality_lead: body.quality_lead ? Number(body.quality_lead) : 1,
      proposal_type: body.proposal_type?.trim() || null,
      channel: body.channel?.trim() || "Manual",
      margin: body.margin ? Number(body.margin) : null,
      due_date: body.due_date || null,
      delivery_date: body.delivery_date || null,
      notes: body.notes?.trim() || null,
      created_by: session.user.id,
      archived: false,
    }

    console.log("🔥 Processed deal data:", JSON.stringify(dealData, null, 2))

    const deal = await CRMService.createDeal(dealData)
    console.log("🔥 Deal created:", deal?.id)

    if (!deal) {
      console.log("❌ Deal creation failed")
      return NextResponse.json({ success: false, error: "Error al crear el lead" }, { status: 500 })
    }

    console.log("✅ Deal created successfully:", deal.id)

    return NextResponse.json({
      success: true,
      deal,
      message: "Lead creado exitosamente",
    })
  } catch (error) {
    console.error("❌ Error creating deal:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
