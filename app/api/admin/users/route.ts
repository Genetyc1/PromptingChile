import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { UserService } from "@/app/services/user-service"
import { AuditService } from "@/app/services/audit-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("🔍 Admin users API called")

    const session = await getServerSession(authOptions)

    if (!session?.user || !["owner", "admin"].includes(session.user.role as string)) {
      console.log("❌ Unauthorized access to users API")
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    console.log(`✅ Authorized user accessing users: ${session.user.email}`)

    // Log this access
    await AuditService.logAction({
      userEmail: session.user.email!,
      action: "VIEW_USERS",
      resource: "Users List",
      details: "Accessed users management",
      ipAddress: "unknown",
      userAgent: "API Request",
    })

    // Get users
    const users = await UserService.getAllUsers()

    console.log(`📊 Retrieved ${users.length} users`)

    // Remove sensitive data and ensure serializable
    const safeUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive !== false, // Default to true if undefined
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
      lastLogin: user.lastLogin ? new Date(user.lastLogin).toISOString() : null,
    }))

    console.log("✅ Users API response prepared successfully")
    return NextResponse.json(safeUsers)
  } catch (error) {
    console.error("❌ Error in users API:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function POST(request: Request) {
  try {
    console.log("📝 Creating new user via admin")

    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      console.log("❌ Unauthorized user creation attempt")
      return NextResponse.json({ error: "Solo el propietario puede crear usuarios" }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, password, role = "analyst" } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email y contraseña son requeridos" }, { status: 400 })
    }

    console.log(`📝 Creating user: ${email}`)

    // Create user
    const user = await UserService.createUser({
      email,
      name: name || null,
      password,
      role,
      isActive: true,
    })

    if (!user) {
      return NextResponse.json({ error: "Error al crear usuario" }, { status: 500 })
    }

    // Log this action
    await AuditService.logAction({
      userEmail: session.user.email!,
      action: "CREATE_USER",
      resource: "User",
      details: `Created user: ${email} with role: ${role}`,
      ipAddress: "unknown",
      userAgent: "API Request",
    })

    console.log("✅ User created successfully")

    // Return safe user data
    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      createdAt: new Date(user.createdAt || new Date()).toISOString(),
      lastLogin: null,
    }

    return NextResponse.json(safeUser)
  } catch (error) {
    console.error("❌ Error creating user:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
