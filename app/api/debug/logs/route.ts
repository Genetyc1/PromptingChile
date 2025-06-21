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

    console.log("🔍 Testing logging system...")

    // Test Supabase connection
    const { data: connectionTest, error: connectionError } = await supabaseServer
      .from("audit_logs")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      return NextResponse.json({
        status: "error",
        message: "Cannot connect to audit_logs table",
        error: connectionError,
        credentials: {
          url: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
          serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
        },
      })
    }

    // Get recent audit logs
    const { data: auditLogs, error: auditError } = await supabaseServer
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    // Get recent login attempts
    const { data: loginAttempts, error: loginError } = await supabaseServer
      .from("login_attempts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10)

    // Calculate stats
    const stats = {
      totalAuditLogs: connectionTest || 0,
      recentAuditLogs: auditLogs?.length || 0,
      recentLoginAttempts: loginAttempts?.length || 0,
      lastAuditLog: auditLogs?.[0]?.created_at || null,
      lastLoginAttempt: loginAttempts?.[0]?.created_at || null,
    }

    return NextResponse.json({
      status: "success",
      connection: "✅ Connected to logging tables",
      stats,
      recentAuditLogs: auditLogs?.map((log) => ({
        action: log.action,
        userEmail: log.user_email,
        resource: log.resource,
        createdAt: log.created_at,
      })),
      recentLoginAttempts: loginAttempts?.map((attempt) => ({
        email: attempt.email,
        success: attempt.success,
        createdAt: attempt.created_at,
      })),
      errors: {
        auditLogs: auditError?.message || null,
        loginAttempts: loginError?.message || null,
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Logging system test failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    console.log("🧪 Creating test logs...")

    // Create test audit log
    const testAuditLog = {
      user_email: session.user.email,
      action: "TEST_LOG",
      resource: "Logging System",
      details: `Test log created at ${new Date().toISOString()}`,
      ip_address: "127.0.0.1",
      user_agent: "Test Agent",
    }

    const { data: auditResult, error: auditError } = await supabaseServer
      .from("audit_logs")
      .insert([testAuditLog])
      .select()
      .single()

    // Create test login attempt
    const testLoginAttempt = {
      email: session.user.email,
      ip_address: "127.0.0.1",
      user_agent: "Test Agent",
      success: true,
      failure_reason: null,
    }

    const { data: loginResult, error: loginError } = await supabaseServer
      .from("login_attempts")
      .insert([testLoginAttempt])
      .select()
      .single()

    return NextResponse.json({
      status: "success",
      message: "✅ Test logs created successfully",
      results: {
        auditLog: {
          success: !auditError,
          id: auditResult?.id,
          error: auditError?.message,
        },
        loginAttempt: {
          success: !loginError,
          id: loginResult?.id,
          error: loginError?.message,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Test log creation failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
