"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Plus, Edit, Trash2, UserPlus, Search } from "lucide-react"
import Link from "next/link"
import type { User } from "../../types/auth"

interface NewUser {
  name: string
  email: string
  role: "owner" | "admin" | "marketing" | "analyst"
  password: string
}

export default function UsersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [newUser, setNewUser] = useState<NewUser>({
    name: "",
    email: "",
    role: "analyst",
    password: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
    if (session?.user?.role !== "owner") {
      router.push("/admin/unauthorized")
    }
  }, [status, session, router])

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users")
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddUser = async () => {
    if (!newUser.name || !newUser.email || !newUser.password) {
      alert("Por favor completa todos los campos")
      return
    }

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      })

      if (response.ok) {
        const user = await response.json()
        setUsers([...users, user])
        setNewUser({ name: "", email: "", role: "analyst", password: "" })
        setShowAddForm(false)
        alert("Usuario creado exitosamente")
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error("Error creating user:", error)
      alert("Error al crear usuario")
    }
  }

  const handleToggleStatus = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-status" }),
      })

      if (response.ok) {
        const updatedUser = await response.json()
        setUsers(users.map((user) => (user.id === userId ? updatedUser : user)))
      }
    } catch (error) {
      console.error("Error toggling user status:", error)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este usuario?")) return

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setUsers(users.filter((user) => user.id !== userId))
        alert("Usuario eliminado exitosamente")
      } else {
        const error = await response.json()
        alert(`Error: ${error.message}`)
      }
    } catch (error) {
      console.error("Error deleting user:", error)
      alert("Error al eliminar usuario")
    }
  }

  const getRoleColor = (role: string) => {
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

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
                <h1 className="text-3xl font-bold text-gray-900">Gestión de Usuarios</h1>
                <p className="text-gray-600">Administrar usuarios y permisos del sistema</p>
              </div>
            </div>
            <Button onClick={() => setShowAddForm(true)} className="bg-[#C28840] hover:bg-[#8B5A2B]">
              <UserPlus className="h-4 w-4 mr-2" />
              Agregar Usuario
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Formulario para agregar usuario */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Agregar Nuevo Usuario</CardTitle>
                <CardDescription>Crear una nueva cuenta de usuario</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Nombre Completo</Label>
                    <Input
                      id="name"
                      value={newUser.name}
                      onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      placeholder="Nombre del usuario"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      placeholder="email@ejemplo.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rol</Label>
                    <Select
                      value={newUser.role}
                      onValueChange={(value: any) => setNewUser({ ...newUser, role: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="analyst">Analista</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
                        <SelectItem value="owner">Propietario</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="password">Contraseña</Label>
                    <Input
                      id="password"
                      type="password"
                      value={newUser.password}
                      onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      placeholder="Contraseña segura"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button onClick={handleAddUser} className="bg-[#C28840] hover:bg-[#8B5A2B]">
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Usuario
                  </Button>
                  <Button onClick={() => setShowAddForm(false)} variant="outline">
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de usuarios */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Usuarios del Sistema</CardTitle>
                  <CardDescription>Total: {users.length} usuarios registrados</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar usuarios..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3">Usuario</th>
                      <th className="text-left p-3">Email</th>
                      <th className="text-left p-3">Rol</th>
                      <th className="text-left p-3">Estado</th>
                      <th className="text-left p-3">Último Login</th>
                      <th className="text-left p-3">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="p-3">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-xs text-gray-500">ID: {user.id}</div>
                          </div>
                        </td>
                        <td className="p-3">{user.email}</td>
                        <td className="p-3">
                          <Badge className={getRoleColor(user.role)}>{user.role.toUpperCase()}</Badge>
                        </td>
                        <td className="p-3">
                          <div className="flex items-center space-x-2">
                            <Switch
                              checked={user.isActive}
                              onCheckedChange={() => handleToggleStatus(user.id)}
                              disabled={user.role === "owner"}
                            />
                            <span className="text-xs">{user.isActive ? "Activo" : "Inactivo"}</span>
                          </div>
                        </td>
                        <td className="p-3 text-xs text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleString("es-CL") : "Nunca"}
                        </td>
                        <td className="p-3">
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            {user.role !== "owner" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleDeleteUser(user.id)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
