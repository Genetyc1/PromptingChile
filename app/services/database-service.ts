// Secure database service using Supabase
import { supabaseServer } from "@/app/lib/supabase"

export const DatabaseService = {
  // Users
  async getUsers() {
    console.log("📋 DatabaseService.getUsers called")
    try {
      const { data, error } = await supabaseServer
        .from("users")
        .select("id, email, name, role, is_active, created_at, last_login")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ DatabaseService.getUsers error:", error)
        throw error
      }

      console.log(`✅ DatabaseService.getUsers success: ${data?.length || 0} users`)
      return data
    } catch (error) {
      console.error("❌ DatabaseService.getUsers failed:", error)
      throw error
    }
  },

  async getUserByEmail(email: string) {
    console.log("🔍 DatabaseService.getUserByEmail called for:", email)
    try {
      const { data, error } = await supabaseServer.from("users").select("*").eq("email", email).single()

      if (error && error.code !== "PGRST116") {
        console.error("❌ DatabaseService.getUserByEmail error:", error)
        throw error
      }

      console.log(data ? "✅ User found" : "❌ User not found")
      return data
    } catch (error) {
      console.error("❌ DatabaseService.getUserByEmail failed:", error)
      throw error
    }
  },

  async createUser(userData: any) {
    console.log("👤 DatabaseService.createUser called")
    console.log("📝 User data:", { ...userData, password_hash: "[HIDDEN]" })

    try {
      const { data, error } = await supabaseServer
        .from("users")
        .insert([
          {
            email: userData.email,
            name: userData.name,
            password_hash: userData.password_hash,
            role: userData.role,
            is_active: userData.is_active,
            provider: userData.provider,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("❌ DatabaseService.createUser error:", error)
        console.error("❌ Error details:", {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint,
        })
        throw error
      }

      console.log("✅ DatabaseService.createUser success:", {
        id: data.id,
        email: data.email,
        role: data.role,
      })
      return data
    } catch (error) {
      console.error("❌ DatabaseService.createUser failed:", error)
      throw error
    }
  },

  async updateUser(id: string, userData: any) {
    console.log("🔄 DatabaseService.updateUser called for:", id)

    try {
      const updateData: any = {}

      if (userData.name) updateData.name = userData.name
      if (userData.email) updateData.email = userData.email
      if (userData.role) updateData.role = userData.role
      if (userData.is_active !== undefined) updateData.is_active = userData.is_active
      if (userData.password_hash) updateData.password_hash = userData.password_hash
      if (userData.last_login) updateData.last_login = userData.last_login

      updateData.updated_at = new Date().toISOString()

      const { data, error } = await supabaseServer.from("users").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("❌ DatabaseService.updateUser error:", error)
        throw error
      }

      console.log("✅ DatabaseService.updateUser success")
      return data
    } catch (error) {
      console.error("❌ DatabaseService.updateUser failed:", error)
      throw error
    }
  },

  async deleteUser(id: string) {
    console.log("🗑️ DatabaseService.deleteUser called for:", id)

    try {
      const { error } = await supabaseServer.from("users").delete().eq("id", id)

      if (error) {
        console.error("❌ DatabaseService.deleteUser error:", error)
        throw error
      }

      console.log("✅ DatabaseService.deleteUser success")
      return true
    } catch (error) {
      console.error("❌ DatabaseService.deleteUser failed:", error)
      throw error
    }
  },

  // Settings
  async getSettings() {
    try {
      const { data, error } = await supabaseServer.from("settings").select("*").single()

      if (error && error.code !== "PGRST116") throw error
      return data
    } catch (error) {
      console.error("❌ DatabaseService.getSettings failed:", error)
      throw error
    }
  },

  async updateSettings(settings: any) {
    try {
      const { data, error } = await supabaseServer
        .from("settings")
        .upsert({
          site_name: settings.siteName,
          site_description: settings.siteDescription,
          site_url: settings.siteUrl,
          admin_email: settings.adminEmail,
          maintenance_mode: settings.maintenanceMode,
          registration_enabled: settings.registrationEnabled,
          email_notifications: settings.emailNotifications,
          theme: settings.theme,
          language: settings.language,
          timezone: settings.timezone,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("❌ DatabaseService.updateSettings failed:", error)
      throw error
    }
  },

  // Audit logs
  async createAuditLog(logData: any) {
    try {
      const { data, error } = await supabaseServer
        .from("audit_logs")
        .insert([
          {
            user_email: logData.userEmail,
            action: logData.action,
            resource: logData.resource,
            details: logData.details,
            ip_address: logData.ipAddress,
            user_agent: logData.userAgent,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("❌ DatabaseService.createAuditLog failed:", error)
      throw error
    }
  },

  async getAuditLogs(limit = 50) {
    try {
      const { data, error } = await supabaseServer
        .from("audit_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error("❌ DatabaseService.getAuditLogs failed:", error)
      throw error
    }
  },

  // Login attempts
  async createLoginAttempt(attemptData: any) {
    try {
      const { data, error } = await supabaseServer
        .from("login_attempts")
        .insert([
          {
            email: attemptData.email,
            ip_address: attemptData.ipAddress,
            user_agent: attemptData.userAgent,
            success: attemptData.success,
            failure_reason: attemptData.failureReason,
          },
        ])
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error("❌ DatabaseService.createLoginAttempt failed:", error)
      throw error
    }
  },

  async getLoginAttempts(limit = 50) {
    try {
      const { data, error } = await supabaseServer
        .from("login_attempts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit)

      if (error) throw error
      return data
    } catch (error) {
      console.error("❌ DatabaseService.getLoginAttempts failed:", error)
      throw error
    }
  },
}
