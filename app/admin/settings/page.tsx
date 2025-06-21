"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Globe, Mail, Shield, Palette, CheckCircle } from "lucide-react"
import Link from "next/link"

interface Settings {
  siteName: string
  siteDescription: string
  siteUrl: string
  adminEmail: string
  maintenanceMode: boolean
  registrationEnabled: boolean
  emailNotifications: boolean
  theme: string
  language: string
  timezone: string
}

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [settings, setSettings] = useState<Settings>({
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
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if (session?.user?.role !== "owner") {
      router.push("/admin/unauthorized")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
      }
    } catch (error) {
      console.error("Error fetching settings:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field: keyof Settings, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000) // Ocultar mensaje después de 3 segundos
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error al guardar configuraciones")
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    if (confirm("¿Estás seguro de que quieres restablecer todas las configuraciones?")) {
      setSettings({
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
      })
      setSaved(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C28840]"></div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Configuración del Sistema</h1>
                <p className="text-gray-600">Configuración general de la aplicación</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleReset} variant="outline" disabled={saving}>
                Restablecer
              </Button>
              <Button onClick={handleSave} className="bg-[#C28840] hover:bg-[#8B5A2B]" disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Cambios
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mensaje de éxito */}
      {saved && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-4 mt-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">¡Configuraciones guardadas exitosamente!</p>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Configuración General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                Configuración General
              </CardTitle>
              <CardDescription>Información básica del sitio web</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteName">Nombre del Sitio</Label>
                  <Input
                    id="siteName"
                    value={settings.siteName}
                    onChange={(e) => handleInputChange("siteName", e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="siteUrl">URL del Sitio</Label>
                  <Input
                    id="siteUrl"
                    value={settings.siteUrl}
                    onChange={(e) => handleInputChange("siteUrl", e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="siteDescription">Descripción del Sitio</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => handleInputChange("siteDescription", e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Email */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Configuración de Email
              </CardTitle>
              <CardDescription>Configuración de notificaciones por email</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="adminEmail">Email del Administrador</Label>
                <Input
                  id="adminEmail"
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => handleInputChange("adminEmail", e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="emailNotifications"
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => handleInputChange("emailNotifications", checked)}
                />
                <Label htmlFor="emailNotifications">Habilitar notificaciones por email</Label>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Seguridad */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2" />
                Configuración de Seguridad
              </CardTitle>
              <CardDescription>Configuración de acceso y seguridad</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="maintenanceMode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => handleInputChange("maintenanceMode", checked)}
                />
                <Label htmlFor="maintenanceMode">Modo de mantenimiento</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="registrationEnabled"
                  checked={settings.registrationEnabled}
                  onCheckedChange={(checked) => handleInputChange("registrationEnabled", checked)}
                />
                <Label htmlFor="registrationEnabled">Permitir registro de nuevos usuarios</Label>
              </div>
            </CardContent>
          </Card>

          {/* Configuración de Apariencia */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="h-5 w-5 mr-2" />
                Configuración de Apariencia
              </CardTitle>
              <CardDescription>Personalización visual del sitio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="theme">Tema</Label>
                  <Select value={settings.theme} onValueChange={(value) => handleInputChange("theme", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Claro</SelectItem>
                      <SelectItem value="dark">Oscuro</SelectItem>
                      <SelectItem value="auto">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="language">Idioma</Label>
                  <Select value={settings.language} onValueChange={(value) => handleInputChange("language", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="timezone">Zona Horaria</Label>
                  <Select value={settings.timezone} onValueChange={(value) => handleInputChange("timezone", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="America/Santiago">Santiago (UTC-3)</SelectItem>
                      <SelectItem value="America/New_York">New York (UTC-5)</SelectItem>
                      <SelectItem value="Europe/Madrid">Madrid (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
