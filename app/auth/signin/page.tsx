"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { signIn, getSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

interface OAuthConfig {
  hasGoogle: boolean
  hasGitHub: boolean
}

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [oauthConfig, setOauthConfig] = useState<OAuthConfig>({ hasGoogle: false, hasGitHub: false })
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const callbackUrl = searchParams.get("callbackUrl") || "/admin"
  const errorParam = searchParams.get("error")

  useEffect(() => {
    // Obtener configuración OAuth del servidor
    fetch("/api/auth/config")
      .then((res) => res.json())
      .then((config) => setOauthConfig(config))
      .catch((err) => console.error("Error loading OAuth config:", err))
  }, [])

  useEffect(() => {
    if (errorParam) {
      setError("Error de autenticación. Por favor, inténtalo de nuevo.")
    }
  }, [errorParam])

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = await getSession()
        if (session) {
          router.push(callbackUrl)
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }
    checkSession()
  }, [router, callbackUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        setError("Credenciales inválidas. Por favor, verifica tu email y contraseña.")
      } else if (result?.ok) {
        router.push(callbackUrl)
      }
    } catch (err) {
      console.error("Sign in error:", err)
      setError("Error inesperado. Por favor, inténtalo de nuevo.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/">
            <img src="/prompting-chile-logo-header.png" alt="Prompting Chile" className="h-16 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-white mb-2">Panel de Administración</h1>
          <p className="text-gray-400">Inicia sesión para acceder al panel</p>
        </div>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-white text-center">Iniciar Sesión</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert className="border-red-800 bg-red-900/20">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-400">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="tu@email.com"
                  required
                  className="bg-black border-gray-700 text-white focus:border-[#C28840]"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-400 mb-2">
                  Contraseña
                </label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  placeholder="••••••••"
                  required
                  className="bg-black border-gray-700 text-white focus:border-[#C28840]"
                />
              </div>

              <Button type="submit" disabled={isLoading} className="w-full bg-[#C28840] hover:bg-[#8B5A2B] text-white">
                {isLoading ? "Iniciando sesión..." : "Iniciar Sesión"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <Link href="/" className="text-gray-400 hover:text-[#C28840] text-sm">
            ← Volver al sitio web
          </Link>
        </div>
      </div>
    </div>
  )
}
