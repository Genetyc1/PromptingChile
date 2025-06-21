import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { AuditService } from "@/app/services/audit-service"

const SETTINGS_KEY = "prompting_chile_settings"

// Configuración por defecto
const defaultSettings = {
  siteName: "Prompting Chile",
  siteDescription: "Expertos en Prompt Engineering y Productividad con IA",
  siteUrl: "https://www.promptingchile.cl",
  adminEmail: "admin@promptingchile.cl",
  maintenanceMode: false,
  registrationEnabled: false,
  emailNotifications: true,
  theme: "light",
  language: "es",
  timezone: "America/Santiago",
}

// Función para cargar configuraciones
function loadSettings() {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) {
        return { ...defaultSettings, ...JSON.parse(stored) }
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }
  return defaultSettings
}

// Función para guardar configuraciones
function saveSettings(settings: any) {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
      return true
    } catch (error) {
      console.error("Error saving settings:", error)
      return false
    }
  }
  return false
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const settings = loadSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()

    // Validar campos requeridos
    if (!body.siteName || !body.siteUrl || !body.adminEmail) {
      return NextResponse.json({ error: "Campos requeridos faltantes" }, { status: 400 })
    }

    // Guardar configuraciones
    const success = saveSettings(body)

    if (!success) {
      return NextResponse.json({ error: "Error al guardar configuraciones" }, { status: 500 })
    }

    // Registrar en auditoría
    await AuditService.logAction({
      userEmail: session.user.email!,
      action: "UPDATE_SETTINGS",
      resource: "System Settings",
      details: "Updated system configuration",
    })

    return NextResponse.json({ success: true, settings: body })
  } catch (error) {
    console.error("Error saving settings:", error)
    return NextResponse.json({ error: "Error al guardar configuraciones" }, { status: 500 })
  }
}
