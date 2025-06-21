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

    // Test 1: Connection
    console.log("🔍 Testing Supabase connection...")
    const { data: connectionTest, error: connectionError } = await supabaseServer
      .from("users")
      .select("count", { count: "exact", head: true })

    // Test 2: Get existing users
    console.log("📋 Fetching existing users...")
    const { data: users, error: usersError } = await supabaseServer
      .from("users")
      .select("id, email, name, role, is_active, created_at, last_login")
      .order("created_at", { ascending: false })

    // Test 3: Try a dry run insert
    console.log("🧪 Testing insert capability...")
    const testUser = {
      email: `test-${Date.now()}@example.com`,
      name: "Test User",
      password_hash: "test_hash_123",
      role: "analyst",
      is_active: true,
      provider: "credentials",
    }

    const { error: insertTestError } = await supabaseServer.from("users").insert([testUser]).select().limit(0)

    return NextResponse.json({
      status: "success",
      timestamp: new Date().toISOString(),
      tests: {
        connection: {
          passed: !connectionError,
          error: connectionError?.message,
          userCount: connectionTest,
        },
        fetchUsers: {
          passed: !usersError,
          error: usersError?.message,
          count: users?.length || 0,
        },
        insertCapability: {
          passed: !insertTestError,
          error: insertTestError?.message,
        },
      },
      existingUsers:
        users?.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          isActive: u.is_active,
          createdAt: u.created_at,
        })) || [],
      environment: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ? "✅ Set" : "❌ Missing",
        serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing",
        nodeEnv: process.env.NODE_ENV,
      },
      recommendations: [
        !connectionError ? "✅ Database connection working" : "❌ Database connection failed",
        !usersError ? "✅ Can read users table" : "❌ Cannot read users table",
        !insertTestError ? "✅ Can insert into users table" : "❌ Cannot insert into users table",
        users?.length === 0 ? "⚠️ No users found - create initial user" : `✅ Found ${users?.length} users`,
      ],
    })
  } catch (error) {
    console.error("❌ Debug failed:", error)
    return NextResponse.json({
      status: "error",
      message: "Debug failed",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
    })
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    console.log("🧪 Creating test user...")

    const testUserData = {
      name: `Test User ${Date.now()}`,
      email: `test-${Date.now()}@example.com`,
      role: "analyst" as const,
      password: "TestPassword123!",
    }

    console.log("📝 Test user data:", { ...testUserData, password: "[HIDDEN]" })

    // Use the UserService directly
    const { UserService } = await import("@/app/services/user-service")

    try {
      const newUser = await UserService.createUser({
        ...testUserData,
        isActive: true,
        provider: "credentials",
      })

      return NextResponse.json({
        status: "success",
        testUser: testUserData.email,
        createdUser: {
          id: newUser.id,
          email: newUser.email,
          name: newUser.name,
          role: newUser.role,
        },
        message: "✅ Test user created successfully",
      })
    } catch (createError) {
      return NextResponse.json({
        status: "error",
        testUser: testUserData.email,
        error: createError instanceof Error ? createError.message : "Unknown error",
        message: "❌ Test user creation failed",
      })
    }
  } catch (error) {
    console.error("❌ Test user creation failed:", error)
    return NextResponse.json({
      status: "error",
      message: "Test user creation failed",
      error: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
