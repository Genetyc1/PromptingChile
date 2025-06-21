"use client"

import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, Home, LogIn } from "lucide-react"
import Link from "next/link"
import { Suspense } from "react"

function ErrorContent() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Hay un problema con la configuración del servidor."
      case "AccessDenied":
        return "Acceso denegado. No tienes permisos para acceder."
      case "Verification":
        return "El token de verificación ha expirado o ya fue usado."
      case "Default":
        return "Ha ocurrido un error durante la autenticación."
      case "CredentialsSignin":
        return "Credenciales inválidas. Verifica tu email y contraseña."
      case "OAuthSignin":
        return "Error al iniciar sesión con el proveedor OAuth."
      case "OAuthCallback":
        return "Error en el callback de OAuth."
      case "OAuthCreateAccount":
        return "Error al crear la cuenta con OAuth."
      case "EmailCreateAccount":
        return "Error al crear la cuenta con email."
      case "Callback":
        return "Error en el callback de autenticación."
      case "OAuthAccountNotLinked":
        return "Esta cuenta ya está vinculada con otro método de inicio de sesión."
      case "EmailSignin":
        return "Error al enviar el email de inicio de sesión."
      case "CredentialsSignup":
        return "Error al crear la cuenta."
      case "SessionRequired":
        return "Debes iniciar sesión para acceder a esta página."
      default:
        return error || "Ha ocurrido un error de autenticación desconocido."
    }
  }

  const getErrorTitle = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "Error de Configuración"
      case "AccessDenied":
        return "Acceso Denegado"
      case "Verification":
        return "Error de Verificación"
      case "CredentialsSignin":
        return "Credenciales Inválidas"
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
        return "Error de OAuth"
      default:
        return "Error de Autenticación"
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <Card className="w-full max-w-md bg-gray-900 border-gray-800">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-400" />
          </div>
          <CardTitle className="text-white">{getErrorTitle(error)}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-400">{getErrorMessage(error)}</p>

          {error && (
            <div className="bg-gray-800 p-3 rounded-md">
              <p className="text-xs text-gray-500">Código de error:</p>
              <p className="text-sm text-gray-300 font-mono">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            <Button asChild className="w-full bg-[#C28840] hover:bg-[#8B5A2B]">
              <Link href="/auth/signin">
                <LogIn className="mr-2 h-4 w-4" />
                Intentar de nuevo
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full border-gray-700 text-white hover:bg-gray-800">
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Volver al inicio
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white">Cargando...</div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  )
}
