import { NextResponse } from "next/server"
import { supabaseServer } from "@/app/lib/supabase"
import type { Subscriber } from "@/app/types/subscriber"

// Force dynamic rendering
export const dynamic = "force-dynamic"
export const runtime = "nodejs"

// Rate limiting simple en memoria
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")
  const realIP = request.headers.get("x-real-ip")

  if (forwarded) {
    return forwarded.split(",")[0].trim()
  }

  if (realIP) {
    return realIP
  }

  return "unknown"
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutos
  const maxAttempts = 5

  const record = rateLimitMap.get(ip)

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs })
    return true
  }

  if (record.count >= maxAttempts) {
    return false
  }

  record.count++
  return true
}

function validateEmail(email: string): string | null {
  if (!email || typeof email !== "string") {
    return null
  }

  const trimmed = email.toLowerCase().trim()
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!emailRegex.test(trimmed) || trimmed.length > 100) {
    return null
  }

  return trimmed
}

function sanitizeInput(input: string): string {
  if (!input || typeof input !== "string") {
    return ""
  }

  return input.replace(/[<>]/g, "").replace(/['"]/g, "").trim().substring(0, 100)
}

export async function POST(request: Request) {
  try {
    console.log("📧 Newsletter subscription request received")

    // 1. Rate limiting básico
    const clientIP = getClientIP(request)
    if (!checkRateLimit(clientIP)) {
      console.warn(`🚫 Rate limit excedido para IP: ${clientIP}`)
      return NextResponse.json(
        {
          success: false,
          error: "Rate limit exceeded",
          message: "Demasiados intentos. Intenta de nuevo en unos minutos.",
        },
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // 2. Parsear datos
    let body
    try {
      body = await request.json()
    } catch (error) {
      console.error("❌ Error al parsear JSON:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON",
          message: "Formato de datos inválido",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const { email, name, source, status = "active", honeypot } = body

    // 3. Verificar honeypot (anti-bot básico)
    if (honeypot && honeypot.trim() !== "") {
      console.warn(`🍯 Bot detectado via honeypot desde IP: ${clientIP}`)
      // Responder como exitoso para confundir bots
      return NextResponse.json(
        {
          success: true,
          message: "Suscripción procesada exitosamente",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // 4. Validar email
    const sanitizedEmail = validateEmail(email)
    if (!sanitizedEmail) {
      console.warn(`🚫 Email inválido desde IP: ${clientIP}: ${email}`)
      return NextResponse.json(
        {
          success: false,
          error: "Invalid email",
          message: "El formato del email no es válido",
        },
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // 5. Verificar si el email ya existe
    const { data: existing } = await supabaseServer
      .from("subscribers")
      .select("id, status")
      .eq("email", sanitizedEmail)
      .single()

    if (existing) {
      console.log(`👤 Email ya existe: ${sanitizedEmail}`)
      return NextResponse.json(
        {
          success: false,
          error: "Email already exists",
          message: "Este email ya está registrado en nuestro newsletter",
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    // 6. Sanitizar otros campos
    const sanitizedName = name ? sanitizeInput(name) : ""
    const sanitizedSource = source ? sanitizeInput(source) : "unknown"

    // 7. Crear el nuevo suscriptor
    const { data, error } = await supabaseServer
      .from("subscribers")
      .insert({
        email: sanitizedEmail,
        name: sanitizedName || null,
        status,
        source: sanitizedSource,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Error al crear suscriptor:", error)
      return NextResponse.json(
        {
          success: false,
          error: "Database error",
          message: "Error al procesar la suscripción. Intenta de nuevo.",
        },
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        },
      )
    }

    const newSubscriber: Subscriber = {
      id: data.id,
      email: data.email,
      name: data.name || undefined,
      createdAt: new Date(data.created_at),
      status: data.status as "active" | "unsubscribed",
      source: data.source || undefined,
    }

    console.log(`✅ Suscriptor creado exitosamente: ${newSubscriber.email}`)

    return NextResponse.json(
      {
        success: true,
        data: newSubscriber,
        message: "¡Gracias por suscribirte! Te mantendremos informado.",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  } catch (error) {
    console.error("❌ Error crítico en POST /api/newsletter/subscribe:", error)

    // Asegurar que siempre devolvemos JSON válido
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        message: "Error interno del servidor",
      },
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
