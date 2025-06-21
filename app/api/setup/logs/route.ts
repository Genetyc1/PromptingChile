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

    console.log("🔧 Setting up logging tables...")

    // Create audit_logs table if it doesn't exist
    const auditTableSQL = `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_email VARCHAR(255) NOT NULL,
        action VARCHAR(100) NOT NULL,
        resource VARCHAR(255) NOT NULL,
        details TEXT,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Create login_attempts table if it doesn't exist
    const loginTableSQL = `
      CREATE TABLE IF NOT EXISTS login_attempts (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        email VARCHAR(255) NOT NULL,
        ip_address INET,
        user_agent TEXT,
        success BOOLEAN NOT NULL,
        failure_reason VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `

    // Create indexes
    const indexesSQL = `
      CREATE INDEX IF NOT EXISTS idx_audit_logs_user_email ON audit_logs(user_email);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
      CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
      CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);
      CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at DESC);
    `

    // Execute SQL commands
    const { error: auditError } = await supabaseServer.rpc("exec_sql", { sql: auditTableSQL })
    const { error: loginError } = await supabaseServer.rpc("exec_sql", { sql: loginTableSQL })
    const { error: indexError } = await supabaseServer.rpc("exec_sql", { sql: indexesSQL })

    // Test the tables
    const { data: auditTest, error: auditTestError } = await supabaseServer
      .from("audit_logs")
      .select("count", { count: "exact", head: true })

    const { data: loginTest, error: loginTestError } = await supabaseServer
      .from("login_attempts")
      .select("count", { count: "exact", head: true })

    return NextResponse.json({
      status: "success",
      message: "✅ Logging tables setup completed",
      results: {
        auditTable: {
          created: !auditError,
          error: auditError?.message,
          testPassed: !auditTestError,
          count: auditTest,
        },
        loginTable: {
          created: !loginError,
          error: loginError?.message,
          testPassed: !loginTestError,
          count: loginTest,
        },
        indexes: {
          created: !indexError,
          error: indexError?.message,
        },
      },
    })
  } catch (error) {
    return NextResponse.json({
      status: "error",
      message: "Logging tables setup failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
