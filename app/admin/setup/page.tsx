"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  Database,
  Users,
  Mail,
  Shield,
  Settings,
  CheckCircle,
  AlertCircle,
  Play,
  Loader2,
  Key,
  Server,
} from "lucide-react"
import Link from "next/link"

interface SetupStep {
  id: string
  title: string
  description: string
  icon: any
  status: "pending" | "running" | "completed" | "error"
  required: boolean
  inputs?: {
    name: string
    label: string
    type: string
    placeholder: string
    required: boolean
    value: string
  }[]
  endpoint: string
  method: string
}

export default function SetupPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [steps, setSteps] = useState<SetupStep[]>([
    {
      id: "database-schema",
      title: "Configurar Base de Datos",
      description: "Crear todas las tablas necesarias (users, settings, audit_logs, login_attempts)",
      icon: Database,
      status: "pending",
      required: true,
      endpoint: "/api/setup/database",
      method: "POST",
    },
    {
      id: "subscribers-table",
      title: "Tabla de Suscriptores",
      description: "Crear tabla para el sistema de newsletter y suscriptores",
      icon: Mail,
      status: "pending",
      required: true,
      endpoint: "/api/setup/subscribers",
      method: "POST",
    },
    {
      id: "initial-user",
      title: "Usuario Administrador",
      description: "Crear el primer usuario administrador del sistema",
      icon: Users,
      status: "pending",
      required: true,
      inputs: [
        {
          name: "name",
          label: "Nombre Completo",
          type: "text",
          placeholder: "Ej: Juan Pérez",
          required: true,
          value: "",
        },
        {
          name: "email",
          label: "Email",
          type: "email",
          placeholder: "admin@tudominio.com",
          required: true,
          value: "",
        },
        {
          name: "password",
          label: "Contraseña",
          type: "password",
          placeholder: "Mínimo 8 caracteres",
          required: true,
          value: "",
        },
      ],
      endpoint: "/api/setup/admin-user",
      method: "POST",
    },
    {
      id: "environment-check",
      title: "Variables de Entorno",
      description: "Verificar que todas las variables de entorno estén configuradas correctamente",
      icon: Key,
      status: "pending",
      required: true,
      endpoint: "/api/setup/env-check",
      method: "GET",
    },
    {
      id: "initial-settings",
      title: "Configuración Inicial",
      description: "Configurar los ajustes básicos del sitio web",
      icon: Settings,
      status: "pending",
      required: false,
      inputs: [
        {
          name: "siteName",
          label: "Nombre del Sitio",
          type: "text",
          placeholder: "Mi Sitio Web",
          required: true,
          value: "Prompting Chile",
        },
        {
          name: "siteUrl",
          label: "URL del Sitio",
          type: "url",
          placeholder: "https://midominio.com",
          required: true,
          value: "https://www.promptingchile.cl",
        },
        {
          name: "adminEmail",
          label: "Email de Administrador",
          type: "email",
          placeholder: "admin@midominio.com",
          required: true,
          value: "admin@promptingchile.cl",
        },
        {
          name: "siteDescription",
          label: "Descripción del Sitio",
          type: "textarea",
          placeholder: "Descripción breve de tu sitio web",
          required: false,
          value: "Expertos en Prompt Engineering y Productividad con IA",
        },
      ],
      endpoint: "/api/setup/initial-settings",
      method: "POST",
    },
    {
      id: "security-setup",
      title: "Configuración de Seguridad",
      description: "Configurar políticas de seguridad y auditoría",
      icon: Shield,
      status: "pending",
      required: false,
      endpoint: "/api/setup/security",
      method: "POST",
    },
  ])

  const [currentStep, setCurrentStep] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if (session?.user?.role !== "owner") {
      router.push("/admin/unauthorized")
    }
  }, [status, session, router])

  useEffect(() => {
    checkSystemStatus()
  }, [])

  const checkSystemStatus = async () => {
    try {
      const response = await fetch("/api/setup/status")
      if (response.ok) {
        const status = await response.json()
        updateStepsStatus(status)
      }
    } catch (error) {
      console.error("Error checking system status:", error)
    }
  }

  const updateStepsStatus = (status: any) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) => ({
        ...step,
        status: status[step.id] || "pending",
      })),
    )
  }

  const updateStepInputs = (stepId: string, inputName: string, value: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              inputs: step.inputs?.map((input) => (input.name === inputName ? { ...input, value } : input)),
            }
          : step,
      ),
    )
  }

  const executeStep = async (step: SetupStep) => {
    setCurrentStep(step.id)
    setSteps((prevSteps) => prevSteps.map((s) => (s.id === step.id ? { ...s, status: "running" } : s)))

    addLog(`🚀 Ejecutando: ${step.title}`)

    try {
      const body = step.inputs ? Object.fromEntries(step.inputs.map((input) => [input.name, input.value])) : {}

      const response = await fetch(step.endpoint, {
        method: step.method,
        headers: step.method === "POST" ? { "Content-Type": "application/json" } : {},
        body: step.method === "POST" ? JSON.stringify(body) : undefined,
      })

      const result = await response.json()

      if (response.ok) {
        addLog(`✅ ${step.title} completado exitosamente`)
        if (result.message) addLog(`📝 ${result.message}`)

        setSteps((prevSteps) => prevSteps.map((s) => (s.id === step.id ? { ...s, status: "completed" } : s)))
      } else {
        throw new Error(result.error || "Error desconocido")
      }
    } catch (error: any) {
      addLog(`❌ Error en ${step.title}: ${error.message}`)
      setSteps((prevSteps) => prevSteps.map((s) => (s.id === step.id ? { ...s, status: "error" } : s)))
    } finally {
      setCurrentStep(null)
    }
  }

  const executeAllSteps = async () => {
    const requiredSteps = steps.filter((step) => step.required && step.status !== "completed")

    for (const step of requiredSteps) {
      await executeStep(step)
      // Pequeña pausa entre pasos
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }

    addLog("🎉 Configuración inicial completada")
  }

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs((prev) => [...prev, `[${timestamp}] ${message}`])
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "running":
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />
      case "error":
        return <AlertCircle className="h-5 w-5 text-red-500" />
      default:
        return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
    }
  }

  const getStatusBadge = (status: string, required: boolean) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="default" className="bg-green-500">
            Completado
          </Badge>
        )
      case "running":
        return (
          <Badge variant="default" className="bg-blue-500">
            Ejecutando...
          </Badge>
        )
      case "error":
        return <Badge variant="destructive">Error</Badge>
      default:
        return <Badge variant={required ? "destructive" : "secondary"}>{required ? "Requerido" : "Opcional"}</Badge>
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C28840]"></div>
      </div>
    )
  }

  if (!session) return null

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const totalSteps = steps.length
  const progress = (completedSteps / totalSteps) * 100

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
                <h1 className="text-3xl font-bold text-gray-900">Configuración Inicial</h1>
                <p className="text-gray-600">Configura tu sitio web paso a paso</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {completedSteps} de {totalSteps} pasos completados
              </div>
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-[#C28840] h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Panel de Pasos */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Pasos de Configuración</h2>
                <Button
                  onClick={executeAllSteps}
                  disabled={currentStep !== null}
                  className="bg-[#C28840] hover:bg-[#8B5A2B]"
                >
                  {currentStep ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Ejecutando...
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4 mr-2" />
                      Ejecutar Todo
                    </>
                  )}
                </Button>
              </div>

              {steps.map((step, index) => (
                <Card key={step.id} className={`${step.status === "running" ? "ring-2 ring-blue-500" : ""}`}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(step.status)}
                        <step.icon className="h-6 w-6 text-gray-600" />
                        <div>
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                          <CardDescription>{step.description}</CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(step.status, step.required)}
                        <Button
                          onClick={() => executeStep(step)}
                          disabled={currentStep !== null}
                          size="sm"
                          variant={step.status === "completed" ? "outline" : "default"}
                        >
                          {step.status === "running" ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : step.status === "completed" ? (
                            "Re-ejecutar"
                          ) : (
                            "Ejecutar"
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  {step.inputs && step.inputs.length > 0 && (
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {step.inputs.map((input) => (
                          <div key={input.name}>
                            <Label htmlFor={`${step.id}-${input.name}`}>
                              {input.label}
                              {input.required && <span className="text-red-500 ml-1">*</span>}
                            </Label>
                            {input.type === "textarea" ? (
                              <Textarea
                                id={`${step.id}-${input.name}`}
                                placeholder={input.placeholder}
                                value={input.value}
                                onChange={(e) => updateStepInputs(step.id, input.name, e.target.value)}
                                required={input.required}
                              />
                            ) : (
                              <Input
                                id={`${step.id}-${input.name}`}
                                type={input.type}
                                placeholder={input.placeholder}
                                value={input.value}
                                onChange={(e) => updateStepInputs(step.id, input.name, e.target.value)}
                                required={input.required}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>

            {/* Panel de Logs */}
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="h-5 w-5 mr-2" />
                    Registro de Actividad
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-900 text-green-400 p-4 rounded-lg h-96 overflow-y-auto font-mono text-sm">
                    {logs.length === 0 ? (
                      <div className="text-gray-500">Esperando actividad...</div>
                    ) : (
                      logs.map((log, index) => (
                        <div key={index} className="mb-1">
                          {log}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Importante:</strong> Asegúrate de tener configuradas todas las variables de entorno necesarias
                  antes de ejecutar la configuración.
                </AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
