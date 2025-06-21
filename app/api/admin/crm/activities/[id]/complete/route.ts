import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { CRMService } from "@/app/services/crm-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const activity = await CRMService.completeActivity(params.id)

    return NextResponse.json({
      success: true,
      activity,
    })
  } catch (error) {
    console.error("Error completing activity:", error)
    return NextResponse.json({ success: false, error: "Error completing activity" }, { status: 500 })
  }
}
