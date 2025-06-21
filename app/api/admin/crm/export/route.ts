import { NextResponse } from "next/server"
import { CRMService } from "@/app/services/crm-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const csvContent = await CRMService.exportDealsToCSV()

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="deals-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    })
  } catch (error) {
    console.error("Error exporting deals:", error)
    return NextResponse.json({ success: false, error: "Error exporting deals" }, { status: 500 })
  }
}
