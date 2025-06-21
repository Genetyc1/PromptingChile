import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { supabaseServer } from "@/app/lib/supabase"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    console.log("🚀 Starting database setup...")

    const results: any = {
      tables: {},
      users: {},
      settings: {},
    }

    // 1. Create users table
    console.log("1️⃣ Creating users table...")
    try {
      const { error: usersError } = await supabaseServer.rpc("exec_sql", {
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            role VARCHAR(50) NOT NULL DEFAULT 'analyst',
            is_active BOOLEAN DEFAULT true,
            provider VARCHAR(50) DEFAULT 'credentials',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            last_login TIMESTAMP WITH TIME ZONE
          );
        `,
      })

      results.tables.users = {
        created: !usersError,
        error: usersError?.message,
      }
    } catch (err) {
      results.tables.users = {
        created: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }
    }

    // 2. Create other tables
    const otherTables = [
      {
        name: "settings",
        sql: `
          CREATE TABLE IF NOT EXISTS settings (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            site_name VARCHAR(255) DEFAULT 'Admin Panel',
            site_description TEXT,
            site_url VARCHAR(255),
            admin_email VARCHAR(255),
            maintenance_mode BOOLEAN DEFAULT false,
            registration_enabled BOOLEAN DEFAULT false,
            email_notifications BOOLEAN DEFAULT true,
            theme VARCHAR(50) DEFAULT 'light',
            language VARCHAR(10) DEFAULT 'es',
            timezone VARCHAR(50) DEFAULT 'America/Santiago',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
      {
        name: "audit_logs",
        sql: `
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
        `,
      },
      {
        name: "login_attempts",
        sql: `
          CREATE TABLE IF NOT EXISTS login_attempts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            email VARCHAR(255) NOT NULL,
            ip_address INET,
            user_agent TEXT,
            success BOOLEAN NOT NULL,
            failure_reason VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `,
      },
    ]

    for (const table of otherTables) {
      try {
        const { error } = await supabaseServer.rpc("exec_sql", { sql: table.sql })
        results.tables[table.name] = {
          created: !error,
          error: error?.message,
        }
      } catch (err) {
        results.tables[table.name] = {
          created: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }
      }
    }

    // 3. Create initial users if they don't exist
    console.log("3️⃣ Creating initial users...")
    const initialUsers = [
      {
        email: "owner@promptingchile.cl",
        name: "Owner",
        password: "OwnerPass2024!",
        role: "owner",
      },
      {
        email: "admin@promptingchile.cl",
        name: "Administrator",
        password: "AdminPass2024!",
        role: "administrator",
      },
    ]

    for (const user of initialUsers) {
      try {
        // Check if user exists
        const { data: existingUser } = await supabaseServer.from("users").select("id").eq("email", user.email).single()

        if (!existingUser) {
          const hashedPassword = await bcrypt.hash(user.password, 12)

          const { data, error } = await supabaseServer
            .from("users")
            .insert([
              {
                email: user.email,
                name: user.name,
                password_hash: hashedPassword,
                role: user.role,
                is_active: true,
                provider: "credentials",
              },
            ])
            .select()
            .single()

          results.users[user.email] = {
            created: !error,
            id: data?.id,
            error: error?.message,
          }
        } else {
          results.users[user.email] = {
            created: false,
            message: "User already exists",
          }
        }
      } catch (err) {
        results.users[user.email] = {
          created: false,
          error: err instanceof Error ? err.message : "Unknown error",
        }
      }
    }

    // 4. Create initial settings
    console.log("4️⃣ Creating initial settings...")
    try {
      const { data: existingSettings } = await supabaseServer.from("settings").select("id").single()

      if (!existingSettings) {
        const { data, error } = await supabaseServer
          .from("settings")
          .insert([
            {
              site_name: "Prompting Chile Admin",
              site_description: "Panel de administración para Prompting Chile",
              site_url: "https://promptingchile.cl",
              admin_email: "owner@promptingchile.cl",
              maintenance_mode: false,
              registration_enabled: false,
              email_notifications: true,
              theme: "light",
              language: "es",
              timezone: "America/Santiago",
            },
          ])
          .select()
          .single()

        results.settings = {
          created: !error,
          id: data?.id,
          error: error?.message,
        }
      } else {
        results.settings = {
          created: false,
          message: "Settings already exist",
        }
      }
    } catch (err) {
      results.settings = {
        created: false,
        error: err instanceof Error ? err.message : "Unknown error",
      }
    }

    console.log("✅ Database setup completed!")

    return NextResponse.json({
      status: "success",
      message: "✅ Database setup completed successfully",
      results,
      summary: {
        tablesCreated: Object.values(results.tables).filter((t: any) => t.created).length,
        usersCreated: Object.values(results.users).filter((u: any) => u.created).length,
        settingsCreated: results.settings.created ? 1 : 0,
      },
    })
  } catch (error) {
    console.error("❌ Database setup failed:", error)
    return NextResponse.json({
      status: "error",
      message: "Database setup failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
