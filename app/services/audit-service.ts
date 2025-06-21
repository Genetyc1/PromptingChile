import { supabaseServer } from "@/app/lib/supabase"

export const AuditService = {
  async logAction(data: {
    userEmail: string
    action: string
    resource: string
    details?: string
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      console.log(`📝 Logging action: ${data.action} on ${data.resource} by ${data.userEmail}`)

      // Try to log to Supabase first
      try {
        const { data: result, error } = await supabaseServer
          .from("audit_logs")
          .insert([
            {
              user_email: data.userEmail,
              action: data.action,
              resource: data.resource,
              details: data.details || null,
              ip_address: data.ipAddress || null,
              user_agent: data.userAgent || null,
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("❌ Supabase audit log failed:", error)
          // Fallback to localStorage
          this.logToLocalStorage(data)
          return null
        }

        console.log("✅ Action logged to Supabase")
        return result
      } catch (supabaseError) {
        console.error("❌ Supabase audit log error:", supabaseError)
        // Fallback to localStorage
        this.logToLocalStorage(data)
        return null
      }
    } catch (error) {
      console.error("❌ Audit logging failed completely:", error)
      return null
    }
  },

  async logLoginAttempt(data: {
    email: string
    success: boolean
    failureReason?: string
    ipAddress?: string
    userAgent?: string
  }) {
    try {
      console.log(`🔐 Logging login attempt: ${data.email} - ${data.success ? "Success" : "Failed"}`)

      // Try to log to Supabase first
      try {
        const { data: result, error } = await supabaseServer
          .from("login_attempts")
          .insert([
            {
              email: data.email,
              success: data.success,
              failure_reason: data.failureReason || null,
              ip_address: data.ipAddress || null,
              user_agent: data.userAgent || null,
            },
          ])
          .select()
          .single()

        if (error) {
          console.error("❌ Supabase login attempt log failed:", error)
          // Fallback to localStorage
          this.logLoginToLocalStorage(data)
          return null
        }

        console.log("✅ Login attempt logged to Supabase")
        return result
      } catch (supabaseError) {
        console.error("❌ Supabase login attempt log error:", supabaseError)
        // Fallback to localStorage
        this.logLoginToLocalStorage(data)
        return null
      }
    } catch (error) {
      console.error("❌ Login attempt logging failed completely:", error)
      return null
    }
  },

  async getAuditLogs(limit = 50) {
    try {
      console.log("🔍 Fetching audit logs...")

      const { data, error } = await supabaseServer
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("❌ Failed to fetch audit logs:", error)
        // Fallback to localStorage
        return this.getLogsFromLocalStorage()
      }

      console.log(`✅ Fetched ${data?.length || 0} audit logs from Supabase`)
      return data || []
    } catch (error) {
      console.error("❌ Audit logs fetch failed:", error)
      return this.getLogsFromLocalStorage()
    }
  },

  async getLoginAttempts(limit = 50) {
    try {
      console.log("🔍 Fetching login attempts...")

      const { data, error } = await supabaseServer
        .from("login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) {
        console.error("❌ Failed to fetch login attempts:", error)
        return []
      }

      console.log(`✅ Fetched ${data?.length || 0} login attempts from Supabase`)
      return data || []
    } catch (error) {
      console.error("❌ Login attempts fetch failed:", error)
      return []
    }
  },

  async getSecurityStats() {
    try {
      console.log("📊 Calculating security stats...")

      // Get login attempts from last 24 hours
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const { data: recentAttempts, error: attemptsError } = await supabaseServer
        .from("login_attempts")
        .select("*")
        .gte("created_at", yesterday.toISOString())

      // Get all login attempts
      const { data: allAttempts, error: allAttemptsError } = await supabaseServer
        .from("login_attempts")
        .select("success")

      // Get audit logs count
      const { data: auditCount, error: auditError } = await supabaseServer
        .from("audit_logs")
        .select("count", { count: "exact", head: true })

      const stats = {
        totalLoginAttempts: allAttempts?.length || 0,
        failedLoginAttempts: allAttempts?.filter((a) => !a.success).length || 0,
        loginAttemptsToday: recentAttempts?.length || 0,
        failedAttemptsToday: recentAttempts?.filter((a) => !a.success).length || 0,
        totalAuditLogs: auditCount || 0,
        lastUpdated: new Date().toISOString(),
      }

      console.log("📊 Security stats calculated:", stats)
      return stats
    } catch (error) {
      console.error("❌ Security stats calculation failed:", error)
      return {
        totalLoginAttempts: 0,
        failedLoginAttempts: 0,
        loginAttemptsToday: 0,
        failedAttemptsToday: 0,
        totalAuditLogs: 0,
        lastUpdated: new Date().toISOString(),
      }
    }
  },

  // Fallback methods for localStorage
  logToLocalStorage(data: any) {
    try {
      if (typeof window !== "undefined") {
        const logs = JSON.parse(localStorage.getItem("audit_logs") || "[]")
        logs.unshift({ ...data, created_at: new Date().toISOString(), id: Date.now() })
        localStorage.setItem("audit_logs", JSON.stringify(logs.slice(0, 100))) // Keep last 100
        console.log("📝 Action logged to localStorage (fallback)")
      }
    } catch (error) {
      console.error("❌ localStorage audit log failed:", error)
    }
  },

  logLoginToLocalStorage(data: any) {
    try {
      if (typeof window !== "undefined") {
        const logs = JSON.parse(localStorage.getItem("login_attempts") || "[]")
        logs.unshift({ ...data, created_at: new Date().toISOString(), id: Date.now() })
        localStorage.setItem("login_attempts", JSON.stringify(logs.slice(0, 100))) // Keep last 100
        console.log("🔐 Login attempt logged to localStorage (fallback)")
      }
    } catch (error) {
      console.error("❌ localStorage login log failed:", error)
    }
  },

  getLogsFromLocalStorage() {
    try {
      if (typeof window !== "undefined") {
        const logs = JSON.parse(localStorage.getItem("audit_logs") || "[]")
        console.log(`📋 Retrieved ${logs.length} logs from localStorage (fallback)`)
        return logs
      }
      return []
    } catch (error) {
      console.error("❌ localStorage logs retrieval failed:", error)
      return []
    }
  },
}
