import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { CRMService } from "@/app/services/crm-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(request: NextRequest, { params }: { params: { dealId: string } }) {
  try {
    console.log("🔥 GET activities for deal:", params.dealId)
    const activities = await CRMService.getDealActivities(params.dealId)

    return NextResponse.json({
      success: true,
      activities,
    })
  } catch (error) {
    console.error("❌ Error fetching deal activities:", error)
    return NextResponse.json({ success: false, error: "Error fetching activities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { dealId: string } }) {
  try {
    console.log("🔥 POST activity for deal:", params.dealId)

    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      console.log("❌ No session for activity creation")
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    console.log("🔥 Activity request body:", JSON.stringify(body, null, 2))

    // Validar campos requeridos
    if (!body.title?.trim()) {
      console.log("❌ Missing activity title")
      return NextResponse.json({ success: false, error: "El título es requerido" }, { status: 400 })
    }

    if (!body.scheduled_date) {
      console.log("❌ Missing scheduled_date")
      return NextResponse.json({ success: false, error: "La fecha es requerida" }, { status: 400 })
    }

    const activityData = {
      deal_id: params.dealId,
      title: body.title.trim(),
      description: body.description?.trim() || null,
      type: body.type || "task",
      scheduled_date: body.scheduled_date,
      scheduled_time: body.scheduled_time || null,
      status: body.status || "pending",
      created_by: session.user.id,
    }

    console.log("🔥 Processed activity data:", JSON.stringify(activityData, null, 2))

    const activity = await CRMService.createActivity(activityData)

    console.log("✅ Activity created successfully:", activity.id)

    return NextResponse.json({
      success: true,
      activity,
    })
  } catch (error) {
    console.error("❌ Error creating activity:", error)
    return NextResponse.json({ success: false, error: "Error creating activity" }, { status: 500 })
  }
}
