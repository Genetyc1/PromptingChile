import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { CRMService } from "@/app/services/crm-service"
import type { DealStatus } from "@/app/types/crm"

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

    const body = await request.json()
    const { status, reason } = body

    const deal = await CRMService.updateDealStatus(params.dealId, status as DealStatus, reason, session.user.id)

    return NextResponse.json({
      success: true,
      deal,
    })
  } catch (error) {
    console.error("Error updating deal status:", error)
    return NextResponse.json({ success: false, error: "Error updating deal status" }, { status: 500 })
  }
}
