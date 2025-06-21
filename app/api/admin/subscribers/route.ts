import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { SubscriberService } from "@/app/services/subscriber-service"
import { AuditService } from "@/app/services/audit-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    console.log("🔍 Admin subscribers API called")

    const session = await getServerSession(authOptions)

    if (!session?.user || !["owner", "admin"].includes(session.user.role as string)) {
      console.log("❌ Unauthorized access to subscribers API")
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    console.log(`✅ Authorized user accessing subscribers: ${session.user.email}`)

    // Log this access
    await AuditService.logAction({
      userEmail: session.user.email!,
      action: "VIEW_SUBSCRIBERS",
      resource: "Subscribers List",
      details: "Accessed subscribers management",
      ipAddress: "unknown",
      userAgent: "API Request",
    })

    // Get subscribers
    const subscribers = await SubscriberService.getAllSubscribers()
    const stats = await SubscriberService.getSubscriberStats()

    console.log(`📊 Retrieved ${subscribers.length} subscribers`)

    // Ensure dates are serializable
    const serializedSubscribers = subscribers.map((sub) => ({
      id: sub.id,
      email: sub.email,
      name: sub.name || null,
      status: sub.status,
      source: sub.source || null,
      createdAt: sub.created_at ? new Date(sub.created_at).toISOString() : new Date().toISOString(),
      updatedAt: sub.updated_at ? new Date(sub.updated_at).toISOString() : new Date().toISOString(),
    }))

    const response = {
      success: true,
      data: serializedSubscribers,
      stats: {
        ...stats,
        lastUpdate: new Date().toISOString(),
      },
      metadata: {
        totalSubscribers: subscribers.length,
        timestamp: new Date().toISOString(),
      },
    }

    console.log("✅ Subscribers API response prepared successfully")
    return NextResponse.json(response)
  } catch (error) {
    console.error("❌ Error in subscribers API:", error)
    return NextResponse.json(
      {
        success: false,
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
    console.log("📝 Creating new subscriber via admin")

    const session = await getServerSession(authOptions)

    if (!session?.user || !["owner", "admin"].includes(session.user.role as string)) {
      console.log("❌ Unauthorized subscriber creation attempt")
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { email, name, status = "active", source = "manual" } = body

    if (!email) {
      return NextResponse.json({ success: false, error: "Email es requerido" }, { status: 400 })
    }

    console.log(`📝 Creating subscriber: ${email}`)

    // Create subscriber
    const subscriber = await SubscriberService.createSubscriber({
      email,
      name: name || null,
      status,
      source,
    })

    if (!subscriber) {
      return NextResponse.json({ success: false, error: "Error al crear suscriptor" }, { status: 500 })
    }

    // Log this action
    await AuditService.logAction({
      userEmail: session.user.email!,
      action: "CREATE_SUBSCRIBER",
      resource: "Subscriber",
      details: `Created subscriber: ${email}`,
      ipAddress: "unknown",
      userAgent: "API Request",
    })

    console.log("✅ Subscriber created successfully")
    return NextResponse.json({
      success: true,
      data: {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name,
        status: subscriber.status,
        source: subscriber.source,
        createdAt: new Date(subscriber.created_at).toISOString(),
      },
      message: "Suscriptor creado exitosamente",
    })
  } catch (error) {
    console.error("❌ Error creating subscriber:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
