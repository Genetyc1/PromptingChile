"use client"

import { useSession, signOut } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Mail, BarChart3, Settings, Shield, Plug, LogOut, Users, Wrench, ShoppingBag } from "lucide-react"
import Link from "next/link"

function getRoleColor(role: string) {
  switch (role) {
    case "owner":
      return "bg-purple-100 text-purple-800"
    case "admin":
      return "bg-blue-100 text-blue-800"
    case "marketing":
      return "bg-green-100 text-green-800"
    case "analyst":
      return "bg-yellow-100 text-yellow-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function hasAccess(userRole: string, allowedRoles: string[]) {
  return allowedRoles.includes(userRole)
}

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isSigningOut, setIsSigningOut] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  const handleSignOut = async () => {
    try {
      setIsSigningOut(true)

      // Llamar al endpoint personalizado de signout
      await fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      // Usar signOut de NextAuth con configuración específica
      await signOut({
        callbackUrl: "/",
        redirect: false, // No redirigir automáticamente
      })

      // Limpiar localStorage y sessionStorage
      if (typeof window !== "undefined") {
        localStorage.clear()
        sessionStorage.clear()

        // Forzar recarga de la página para limpiar el estado
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Error during signout:", error)
      // Fallback: forzar redirección
      if (typeof window !== "undefined") {
        window.location.href = "/"
      }
    } finally {
      setIsSigningOut(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C28840] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  const user = session.user
  const userRole = user.role as string

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
              <p className="text-gray-600">Bienvenido, {user.name}</p>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className={getRoleColor(userRole)}>{userRole.toUpperCase()}</Badge>
              <Button variant="outline" size="sm" onClick={handleSignOut} disabled={isSigningOut}>
                <LogOut className="h-4 w-4 mr-2" />
                {isSigningOut ? "Cerrando..." : "Cerrar Sesión"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Configuración Inicial */}
            <Card className="border-2 border-[#C28840] bg-gradient-to-br from-[#C28840]/5 to-[#C28840]/10">
              <CardHeader>
                <CardTitle className="flex items-center text-[#C28840]">
                  <Wrench className="h-5 w-5 mr-2" />
                  Configuración Inicial
                </CardTitle>
                <CardDescription>Configurar sistema paso a paso</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/setup">
                  <Button className="w-full bg-[#C28840] hover:bg-[#8B5A2B] text-white">Configurar Sistema</Button>
                </Link>
              </CardContent>
            </Card>

            {/* CRM */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2" />
                  CRM
                </CardTitle>
                <CardDescription>Gestión de leads y oportunidades de venta</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href="/admin/crm">
                  <Button className="w-full" variant="outline">
                    Abrir CRM
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Shop */}
            {hasAccess(userRole, ["owner", "admin"]) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <ShoppingBag className="h-5 w-5 mr-2" />
                    Shop
                  </CardTitle>
                  <CardDescription>Gestión de productos y códigos de descuento</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/admin/shop">
                      <Button className="w-full" variant="outline">
                        Gestionar Productos
                      </Button>
                    </Link>
                    <Link href="/admin/shop/new">
                      <Button className="w-full" variant="outline">
                        Crear Producto
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Newsletter */}
            {hasAccess(userRole, ["owner", "admin", "marketing"]) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Newsletter
                  </CardTitle>
                  <CardDescription>Gestiona suscriptores y campañas de email</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/admin/newsletter">
                      <Button className="w-full" variant="outline">
                        Ver Dashboard
                      </Button>
                    </Link>
                    <Link href="/admin/subscribers">
                      <Button className="w-full" variant="outline">
                        Gestionar Suscriptores
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Blog */}
            {hasAccess(userRole, ["owner", "admin", "marketing"]) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Blog
                  </CardTitle>
                  <CardDescription>Crear y gestionar artículos del blog</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Link href="/admin/blog">
                      <Button className="w-full" variant="outline">
                        Gestionar Artículos
                      </Button>
                    </Link>
                    <Link href="/admin/blog/new">
                      <Button className="w-full" variant="outline">
                        Crear Artículo
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Analytics */}
            {hasAccess(userRole, ["owner", "admin", "analyst"]) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Analytics
                  </CardTitle>
                  <CardDescription>Estadísticas y métricas del sitio</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Ver Estadísticas
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Gestión de Usuarios */}
            {hasAccess(userRole, ["owner", "admin"]) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Usuarios
                  </CardTitle>
                  <CardDescription>Gestionar usuarios del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/users">
                    <Button className="w-full" variant="outline">
                      Gestionar Usuarios
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Integraciones */}
            {hasAccess(userRole, ["owner", "admin"]) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Plug className="h-5 w-5 mr-2" />
                    Integraciones
                  </CardTitle>
                  <CardDescription>APIs y plugins externos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/integrations">
                    <Button className="w-full" variant="outline">
                      Configurar APIs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Seguridad */}
            {hasAccess(userRole, ["owner", "admin"]) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield className="h-5 w-5 mr-2" />
                    Seguridad
                  </CardTitle>
                  <CardDescription>Auditoría y respaldos</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/security">
                    <Button className="w-full" variant="outline">
                      Ver Logs
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}

            {/* Configuración */}
            {hasAccess(userRole, ["owner"]) && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Configuración
                  </CardTitle>
                  <CardDescription>Configuración general del sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/admin/settings">
                    <Button className="w-full" variant="outline">
                      Configurar Sistema
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
