"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Save, Key, Mail, MessageSquare, BarChart3 } from "lucide-react"
import Link from "next/link"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  enabled: boolean
  apiKey?: string
  webhookUrl?: string
}

export default function IntegrationsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [integrations, setIntegrations] = useState<Integration[]>([
    {
      id: "openai",
      name: "OpenAI API",
      description: "Integración con GPT para generación de contenido",
      icon: <Key className="h-5 w-5" />,
      enabled: false,
      apiKey: "",
    },
    {
      id: "mailchimp",
      name: "Mailchimp",
      description: "Gestión avanzada de campañas de email",
      icon: <Mail className="h-5 w-5" />,
      enabled: false,
      apiKey: "",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Notificaciones y alertas del sistema",
      icon: <MessageSquare className="h-5 w-5" />,
      enabled: false,
      webhookUrl: "",
    },
    {
      id: "analytics",
      name: "Google Analytics",
      description: "Seguimiento avanzado de métricas",
      icon: <BarChart3 className="h-5 w-5" />,
      enabled: false,
      apiKey: "",
    },
  ])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if (session?.user?.role && !["owner", "admin"].includes(session.user.role as string)) {
      router.push("/admin/unauthorized")
    }
  }, [status, session, router])

  const handleToggle = (id: string) => {
    setIntegrations((prev) =>
      prev.map((integration) =>
        integration.id === id ? { ...integration, enabled: !integration.enabled } : integration,
      ),
    )
  }

  const handleInputChange = (id: string, field: string, value: string) => {
    setIntegrations((prev) =>
      prev.map((integration) => (integration.id === id ? { ...integration, [field]: value } : integration)),
    )
  }

  const handleSave = () => {
    // Aquí guardarías las configuraciones
    console.log("Guardando integraciones:", integrations)
    alert("Configuraciones guardadas exitosamente")
  }

  if (status === "loading") {
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
                <h1 className="text-3xl font-bold text-gray-900">Integraciones</h1>
                <p className="text-gray-600">Configura APIs y servicios externos</p>
              </div>
            </div>
            <Button onClick={handleSave} className="bg-[#C28840] hover:bg-[#8B5A2B]">
              <Save className="h-4 w-4 mr-2" />
              Guardar Cambios
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid gap-6">
            {integrations.map((integration) => (
              <Card key={integration.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {integration.icon}
                      <div>
                        <CardTitle>{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={integration.enabled ? "default" : "secondary"}>
                        {integration.enabled ? "Activo" : "Inactivo"}
                      </Badge>
                      <Switch checked={integration.enabled} onCheckedChange={() => handleToggle(integration.id)} />
                    </div>
                  </div>
                </CardHeader>
                {integration.enabled && (
                  <CardContent className="space-y-4">
                    {integration.apiKey !== undefined && (
                      <div>
                        <Label htmlFor={`${integration.id}-api-key`}>API Key</Label>
                        <Input
                          id={`${integration.id}-api-key`}
                          type="password"
                          placeholder="Ingresa tu API Key"
                          value={integration.apiKey}
                          onChange={(e) => handleInputChange(integration.id, "apiKey", e.target.value)}
                        />
                      </div>
                    )}
                    {integration.webhookUrl !== undefined && (
                      <div>
                        <Label htmlFor={`${integration.id}-webhook`}>Webhook URL</Label>
                        <Input
                          id={`${integration.id}-webhook`}
                          type="url"
                          placeholder="https://hooks.slack.com/..."
                          value={integration.webhookUrl}
                          onChange={(e) => handleInputChange(integration.id, "webhookUrl", e.target.value)}
                        />
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
