import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { CRMService } from "@/app/services/crm-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { dealId: string } }) {
  try {
    const deal = await CRMService.getDealById(params.dealId)

    if (!deal) {
      return NextResponse.json({ success: false, error: "Deal not found" }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      deal,
    })
  } catch (error) {
    console.error("Error fetching deal:", error)
    return NextResponse.json({ success: false, error: "Error fetching deal" }, { status: 500 })
  }
}

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
    const deal = await CRMService.updateDeal(params.dealId, body)

    return NextResponse.json({
      success: true,
      deal,
    })
  } catch (error) {
    console.error("Error updating deal:", error)
    return NextResponse.json({ success: false, error: "Error updating deal" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { dealId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role as string
    if (!["admin", "owner"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    await CRMService.deleteDeal(params.dealId)

    return NextResponse.json({
      success: true,
      message: "Deal deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting deal:", error)
    return NextResponse.json({ success: false, error: "Error deleting deal" }, { status: 500 })
  }
}
