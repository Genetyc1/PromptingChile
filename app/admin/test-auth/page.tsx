"use client"

import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { signOut } from "next-auth/react"

export default function TestAuthPage() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Cargando...</div>
  }

  if (!session) {
    return <div>No hay sesión activa</div>
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Información de Sesión</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <strong>Email:</strong> {session.user.email}
          </div>
          <div>
            <strong>Nombre:</strong> {session.user.name}
          </div>
          <div>
            <strong>Rol:</strong> {session.user.role}
          </div>
          <div>
            <strong>ID:</strong> {session.user.id}
          </div>
          <Button onClick={() => signOut()}>Cerrar Sesión</Button>
        </CardContent>
      </Card>
    </div>
  )
}
