import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"
import Link from "next/link"

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <CardTitle>Acceso Denegado</CardTitle>
          <CardDescription>No tienes permisos para acceder a esta sección</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-gray-600 mb-4">
            Contacta al administrador si necesitas acceso a esta funcionalidad.
          </p>
          <Button asChild>
            <Link href="/admin">Volver al Dashboard</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
