import { type NextRequest, NextResponse } from "next/server"
import { CRMService } from "@/app/services/crm-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { dealId: string } }) {
  try {
    const history = await CRMService.getDealStatusHistory(params.dealId)

    return NextResponse.json({
      success: true,
      history,
    })
  } catch (error) {
    console.error("Error fetching deal history:", error)
    return NextResponse.json({ success: false, error: "Error fetching history" }, { status: 500 })
  }
}
