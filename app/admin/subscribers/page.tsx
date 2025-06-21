"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  UserCheck,
  UserX,
  Download,
  Users,
  TrendingUp,
  Calendar,
  RefreshCw,
  RotateCcw,
  AlertCircle,
} from "lucide-react"

// Definir el tipo directamente aquí para evitar problemas de importación
type Subscriber = {
  id: string
  email: string
  name?: string
  createdAt: Date
  status: "active" | "unsubscribed"
  source?: string
}

export default function AdminSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([])
  const [filteredSubscribers, setFilteredSubscribers] = useState<Subscriber[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    unsubscribed: 0,
    newThisMonth: 0,
  })
  const [newSubscriber, setNewSubscriber] = useState({
    email: "",
    name: "",
    source: "manual",
  })

  const fetchData = async (showRefreshIndicator = false) => {
    try {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }

      console.log("🔄 Cargando datos de suscriptores...")
      setError(null)

      // Primero intentar obtener estadísticas básicas
      const debugResponse = await fetch("/api/debug/subscribers")
      const debugData = await debugResponse.json()

      if (debugResponse.ok && debugData.status === "success") {
        if (debugData.statistics) {
          setStats(debugData.statistics)
        }
      }

      // Luego intentar obtener la lista de suscriptores
      const subscribersResponse = await fetch("/api/admin/subscribers")

      if (subscribersResponse.ok) {
        const subscribersData = await subscribersResponse.json()

        if (subscribersData.success && Array.isArray(subscribersData.data)) {
          // Convertir las fechas correctamente
          const processedSubscribers = subscribersData.data.map((sub: any) => ({
            ...sub,
            createdAt: new Date(sub.createdAt),
          }))

          setSubscribers(processedSubscribers)
          setFilteredSubscribers(processedSubscribers)
          console.log(`✅ Suscriptores cargados: ${processedSubscribers.length}`)
        } else {
          throw new Error(subscribersData.message || "Error al obtener suscriptores")
        }
      } else {
        throw new Error("Error de conexión con el servidor")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(errorMessage)
      console.error("❌ Error:", err)

      // Establecer datos vacíos en caso de error
      setSubscribers([])
      setFilteredSubscribers([])
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    try {
      let filtered = [...subscribers]

      if (searchTerm && searchTerm.trim()) {
        const search = searchTerm.toLowerCase().trim()
        filtered = filtered.filter(
          (subscriber) =>
            subscriber.email.toLowerCase().includes(search) ||
            (subscriber.name && subscriber.name.toLowerCase().includes(search)) ||
            (subscriber.source && subscriber.source.toLowerCase().includes(search)),
        )
      }

      if (filterStatus !== "all") {
        filtered = filtered.filter((subscriber) => subscriber.status === filterStatus)
      }

      setFilteredSubscribers(filtered)
    } catch (err) {
      console.error("Error al filtrar suscriptores:", err)
      setFilteredSubscribers([])
    }
  }, [searchTerm, filterStatus, subscribers])

  const handleRefresh = () => {
    fetchData(true)
  }

  const handleResetData = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas resetear todos los datos a los valores iniciales? Esta acción no se puede deshacer.",
      )
    ) {
      try {
        const response = await fetch("/api/admin/subscribers/reset", { method: "POST" })
        if (response.ok) {
          fetchData(true)
        } else {
          alert("Error al resetear los datos")
        }
      } catch (err) {
        console.error(err)
        alert("Error al resetear los datos")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este suscriptor? Esta acción no se puede deshacer.")) {
      try {
        const response = await fetch(`/api/admin/subscribers/${id}`, { method: "DELETE" })
        if (response.ok) {
          setSubscribers((prevSubscribers) => prevSubscribers.filter((sub) => sub.id !== id))
          fetchData(true)
        } else {
          alert("Error al eliminar el suscriptor")
        }
      } catch (err) {
        console.error(err)
        alert("Error al eliminar el suscriptor")
      }
    }
  }

  const handleStatusChange = async (id: string, currentStatus: "active" | "unsubscribed") => {
    const newStatus = currentStatus === "active" ? "unsubscribed" : "active"

    try {
      const response = await fetch(`/api/admin/subscribers/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        setSubscribers((prevSubscribers) =>
          prevSubscribers.map((sub) => (sub.id === id ? { ...sub, status: newStatus } : sub)),
        )
        fetchData(true)
      } else {
        alert("Error al cambiar el estado del suscriptor")
      }
    } catch (err) {
      console.error(err)
      alert("Error al cambiar el estado del suscriptor")
    }
  }

  const handleAddSubscriber = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch("/api/admin/subscribers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newSubscriber.email,
          name: newSubscriber.name || undefined,
          source: newSubscriber.source,
          status: "active",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setNewSubscriber({ email: "", name: "", source: "manual" })
          setShowAddForm(false)
          fetchData(true)
        } else {
          alert(data.message || "Error al añadir el suscriptor")
        }
      } else {
        alert("Error al añadir el suscriptor")
      }
    } catch (err) {
      console.error(err)
      alert("Error al añadir el suscriptor")
    }
  }

  const handleExport = () => {
    const csvContent = [
      "Email,Nombre,Estado,Fuente,Fecha de Suscripción",
      ...filteredSubscribers.map(
        (sub) =>
          `${sub.email},${sub.name || ""},${sub.status},${sub.source || ""},${sub.createdAt.toLocaleDateString()}`,
      ),
    ].join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `suscriptores-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Header />
        <main className="py-16 px-6">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-[#C28840]" />
                <p className="text-gray-400">Cargando suscriptores...</p>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/admin" className="text-[#C28840] hover:text-[#D4A574] mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
                Gestión de Suscriptores
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button
                onClick={handleResetData}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 text-yellow-400"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetear
              </Button>
              <Button onClick={handleExport} variant="outline" className="border-gray-700 hover:bg-gray-800">
                <Download className="h-4 w-4 mr-2" />
                Exportar CSV
              </Button>
              <Button onClick={() => setShowAddForm(true)} className="bg-[#C28840] hover:bg-[#8B5A2B] text-white">
                <Plus className="h-4 w-4 mr-2" />
                Añadir Suscriptor
              </Button>
            </div>
          </div>

          {/* Mostrar errores si los hay */}
          {error && (
            <Alert className="mb-6 border-red-800 bg-red-900/20">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-red-400">
                <strong>Error:</strong> {error}
                <br />
                <span className="text-sm">
                  Verifica que la tabla de suscriptores esté creada. Puedes usar{" "}
                  <Link href="/admin/setup" className="text-[#C28840] hover:underline">
                    la configuración inicial
                  </Link>{" "}
                  para crearla.
                </span>
              </AlertDescription>
            </Alert>
          )}

          {/* Información de la base de datos */}
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <p className="text-blue-400 text-sm">
              🗄️ <strong>Base de Datos:</strong> Los suscriptores se almacenan en Supabase. Los datos se actualizan en
              tiempo real.
            </p>
          </div>

          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Total Suscriptores</CardTitle>
                <Users className="h-4 w-4 text-[#C28840]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Activos</CardTitle>
                <UserCheck className="h-4 w-4 text-[#C28840]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.active}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Nuevos este mes</CardTitle>
                <TrendingUp className="h-4 w-4 text-[#C28840]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">+{stats.newThisMonth}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-400">Desuscritos</CardTitle>
                <UserX className="h-4 w-4 text-[#C28840]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{stats.unsubscribed}</div>
              </CardContent>
            </Card>
          </div>

          {/* Formulario para añadir suscriptor */}
          {showAddForm && (
            <Card className="bg-gray-900 border-gray-800 mb-8">
              <CardHeader>
                <CardTitle className="text-white">Añadir Nuevo Suscriptor</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddSubscriber} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Input
                    type="email"
                    placeholder="Email *"
                    value={newSubscriber.email}
                    onChange={(e) => setNewSubscriber((prev) => ({ ...prev, email: e.target.value }))}
                    required
                    className="bg-black border-gray-700 text-white"
                  />
                  <Input
                    placeholder="Nombre (opcional)"
                    value={newSubscriber.name}
                    onChange={(e) => setNewSubscriber((prev) => ({ ...prev, name: e.target.value }))}
                    className="bg-black border-gray-700 text-white"
                  />
                  <select
                    value={newSubscriber.source}
                    onChange={(e) => setNewSubscriber((prev) => ({ ...prev, source: e.target.value }))}
                    className="bg-black border border-gray-700 rounded-md px-3 py-2 text-white"
                  >
                    <option value="manual">Manual</option>
                    <option value="website">Website</option>
                    <option value="blog">Blog</option>
                    <option value="shop">Shop</option>
                    <option value="contact">Contact</option>
                    <option value="landing">Landing</option>
                  </select>
                  <div className="flex gap-2">
                    <Button type="submit" className="bg-[#C28840] hover:bg-[#8B5A2B] text-white">
                      Añadir
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddForm(false)}
                      className="border-gray-700"
                    >
                      Cancelar
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Filtros y búsqueda */}
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por email, nombre o fuente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-black border-gray-700 text-white"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-black border border-gray-700 rounded-md px-3 py-2 text-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="active">Activos</option>
                  <option value="unsubscribed">Desuscritos</option>
                </select>
                <div className="text-sm text-gray-400 flex items-center">
                  Mostrando: {filteredSubscribers.length} suscriptores
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de suscriptores */}
          {filteredSubscribers.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg mb-2">No se encontraron suscriptores</p>
              <p className="text-gray-500 text-sm">
                {error
                  ? "Verifica la configuración de la base de datos"
                  : "Añade tu primer suscriptor o verifica los filtros"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSubscribers.map((subscriber) => (
                <Card key={subscriber.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{subscriber.email}</h3>
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              subscriber.status === "active" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                          >
                            {subscriber.status === "active" ? "Activo" : "Desuscrito"}
                          </span>
                          {subscriber.source && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              {subscriber.source}
                            </span>
                          )}
                        </div>
                        {subscriber.name && <p className="text-gray-300 mb-2">{subscriber.name}</p>}
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            Suscrito: {subscriber.createdAt.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleStatusChange(subscriber.id, subscriber.status)}
                          className={`border-gray-700 ${
                            subscriber.status === "active"
                              ? "text-yellow-400 hover:text-yellow-300"
                              : "text-green-400 hover:text-green-300"
                          }`}
                        >
                          {subscriber.status === "active" ? (
                            <UserX className="h-4 w-4" />
                          ) : (
                            <UserCheck className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(subscriber.id)}
                          className="border-gray-700 text-red-400 hover:text-red-300 hover:border-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
