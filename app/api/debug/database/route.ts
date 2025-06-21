import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { supabaseServer } from "@/app/lib/supabase"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    console.log("🔍 Testing database connection...")

    // Test connection to each table
    const tables = ["users", "settings", "audit_logs", "login_attempts"]
    const results: any = {}

    for (const table of tables) {
      try {
        const { data, error } = await supabaseServer.from(table).select("count", { count: "exact", head: true })

        results[table] = {
          exists: !error,
          count: data || 0,
          error: error?.message,
        }
      } catch (err) {
        results[table] = {
          exists: false,
          count: 0,
          error: err instanceof Error ? err.message : "Unknown error",
        }
      }
    }

    // Test basic operations
    const operationTests = {
      canRead: false,
      canWrite: false,
      canUpdate: false,
      canDelete: false,
    }

    try {
      // Test read
      await supabaseServer.from("users").select("id").limit(1)
      operationTests.canRead = true
    } catch (err) {
      console.warn("Read test failed:", err)
    }

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      connection: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
      },
      tables: results,
      operations: operationTests,
      summary: {
        totalTables: tables.length,
        existingTables: Object.values(results).filter((r: any) => r.exists).length,
        totalRecords: Object.values(results).reduce((sum: number, r: any) => sum + (r.count || 0), 0),
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Database test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
