import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { UserService } from "@/app/services/user-service"
import { AuditService } from "@/app/services/audit-service"

export async function POST(request: Request) {
  console.log("🚀 Starting step-by-step user creation test...")

  try {
    // Step 1: Check session
    console.log("1️⃣ Checking session...")
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      console.log("❌ Session check failed")
      return NextResponse.json({ error: "No autorizado", step: "session" }, { status: 403 })
    }
    console.log("✅ Session valid:", session.user.email)

    // Step 2: Parse request body
    console.log("2️⃣ Parsing request body...")
    const body = await request.json()
    console.log("✅ Body parsed:", { ...body, password: body.password ? "[HIDDEN]" : "missing" })

    // Step 3: Validate data
    console.log("3️⃣ Validating data...")
    const { name, email, role, password } = body

    if (!name || !email || !role || !password) {
      console.log("❌ Missing required fields")
      return NextResponse.json(
        {
          error: "Missing required fields",
          required: ["name", "email", "role", "password"],
          received: { name: !!name, email: !!email, role: !!role, password: !!password },
          step: "validation",
        },
        { status: 400 },
      )
    }
    console.log("✅ All required fields present")

    // Step 4: Check if user exists
    console.log("4️⃣ Checking if user exists...")
    const existingUser = await UserService.getUserByEmail(email)
    if (existingUser) {
      console.log("❌ User already exists")
      return NextResponse.json(
        {
          error: "User already exists",
          email,
          step: "duplicate_check",
        },
        { status: 400 },
      )
    }
    console.log("✅ Email is available")

    // Step 5: Create user
    console.log("5️⃣ Creating user...")
    const newUser = await UserService.createUser({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      role,
      password,
      isActive: true,
      provider: "credentials",
    })
    console.log("✅ User created:", { id: newUser.id, email: newUser.email })

    // Step 6: Log audit
    console.log("6️⃣ Creating audit log...")
    try {
      await AuditService.logAction({
        userEmail: session.user.email!,
        action: "CREATE_USER_TEST",
        resource: `User: ${email}`,
        details: `Test user created with role: ${role}`,
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
        userAgent: request.headers.get("user-agent") || "",
      })
      console.log("✅ Audit log created")
    } catch (auditError) {
      console.warn("⚠️ Audit log failed (non-critical):", auditError)
    }

    console.log("🎉 User creation completed successfully!")

    return NextResponse.json({
      status: "success",
      message: "User created successfully",
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        isActive: newUser.isActive,
      },
      steps: [
        "✅ Session validated",
        "✅ Request body parsed",
        "✅ Data validated",
        "✅ Duplicate check passed",
        "✅ User created",
        "✅ Audit logged",
      ],
    })
  } catch (error) {
    console.error("❌ User creation failed:", error)

    return NextResponse.json({
      status: "error",
      message: "User creation failed",
      error: error instanceof Error ? error.message : "Unknown error",
      stack: process.env.NODE_ENV === "development" ? (error instanceof Error ? error.stack : undefined) : undefined,
      step: "creation",
    })
  }
}
