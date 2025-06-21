import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { UserService } from "@/app/services/user-service"
import { AuditService } from "@/app/services/audit-service"

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { action } = body

    if (action === "toggle-status") {
      const updatedUser = await UserService.toggleUserStatus(params.id)

      if (!updatedUser) {
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      // Registrar en auditoría
      await AuditService.logAction({
        userEmail: session.user.email!,
        action: "TOGGLE_USER_STATUS",
        resource: `User: ${updatedUser.email}`,
        details: `User status changed to: ${updatedUser.isActive ? "active" : "inactive"}`,
      })

      return NextResponse.json(updatedUser)
    }

    return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json({ error: "Error al actualizar usuario" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "owner") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const user = await UserService.getUserById(params.id)
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    const deleted = await UserService.deleteUser(params.id)

    if (!deleted) {
      return NextResponse.json({ error: "No se puede eliminar este usuario" }, { status: 400 })
    }

    // Registrar en auditoría
    await AuditService.logAction({
      userEmail: session.user.email!,
      action: "DELETE_USER",
      resource: `User: ${user.email}`,
      details: `Deleted user with role: ${user.role}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json({ error: "Error al eliminar usuario" }, { status: 500 })
  }
}
