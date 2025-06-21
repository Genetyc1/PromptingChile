import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { CRMService } from "@/app/services/crm-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { dealId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role as string
    if (!["admin", "owner"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    // Reabrir el deal cambiando su estado a "Prospección General"
    const deal = await CRMService.updateDealStatus(
      params.dealId,
      "Prospección General",
      "Deal reabierto",
      session.user.id,
    )

    return NextResponse.json({
      success: true,
      deal,
    })
  } catch (error) {
    console.error("Error reopening deal:", error)
    return NextResponse.json({ success: false, error: "Error reopening deal" }, { status: 500 })
  }
}
