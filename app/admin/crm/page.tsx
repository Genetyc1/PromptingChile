"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import {
  ArrowLeft,
  Plus,
  Search,
  Download,
  Eye,
  Edit,
  Building,
  User,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Star,
  Archive,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import type { Deal, DealStatus } from "@/app/types/crm"
import KanbanView from "./components/kanban-view"

const DEAL_STATUSES: DealStatus[] = [
  "Prospección General",
  "Prospección Contingente",
  "Estudio",
  "Entregadas",
  "Negociación",
]

const STATUS_COLORS = {
  "Prospección General": "bg-gray-100 text-gray-800",
  "Prospección Contingente": "bg-blue-100 text-blue-800",
  Estudio: "bg-yellow-100 text-yellow-800",
  Entregadas: "bg-purple-100 text-purple-800",
  Negociación: "bg-orange-100 text-orange-800",
  Ganado: "bg-green-100 text-green-800",
  Perdido: "bg-red-100 text-red-800",
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value)
}

function QualityStars({ rating }: { rating: number }) {
  return (
    <div className="flex">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star key={star} className={`h-4 w-4 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
      ))}
    </div>
  )
}

export default function AdminCRMPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatuses, setSelectedStatuses] = useState<DealStatus[]>([])
  const [showArchived, setShowArchived] = useState(false)
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table")

  const userRole = session?.user?.role as string
  const canEdit = ["admin", "owner"].includes(userRole)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    }
  }, [status, router])

  useEffect(() => {
    loadDeals()
  }, [searchTerm, selectedStatuses, showArchived])

  const loadDeals = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()

      if (searchTerm.trim()) {
        params.set("search", searchTerm.trim())
      }

      if (selectedStatuses.length > 0) {
        params.set("status", selectedStatuses.join(","))
      }

      if (showArchived) {
        params.set("show_archived", "true")
      }

      const response = await fetch(`/api/admin/crm/deals?${params.toString()}`)

      if (response.ok) {
        const data = await response.json()
        setDeals(data.deals || [])
      } else {
        console.error("Error loading deals:", await response.text())
      }
    } catch (error) {
      console.error("Error loading deals:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusFilter = (status: DealStatus) => {
    if (selectedStatuses.includes(status)) {
      setSelectedStatuses(selectedStatuses.filter((s) => s !== status))
    } else {
      setSelectedStatuses([...selectedStatuses, status])
    }
  }

  const handleExport = async () => {
    try {
      const response = await fetch("/api/admin/crm/export")
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `deals-export-${new Date().toISOString().split("T")[0]}.csv`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      }
    } catch (error) {
      console.error("Error exporting deals:", error)
    }
  }

  const handleDealUpdate = async (dealId: string, newStatus: DealStatus) => {
    try {
      const response = await fetch(`/api/admin/crm/deals/${dealId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        loadDeals()
      } else {
        console.error("Error updating deal status")
      }
    } catch (error) {
      console.error("Error updating deal:", error)
    }
  }

  const filteredDeals = deals.filter((deal) => {
    const matchesSearch =
      !searchTerm ||
      deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.organization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deal.contact_email?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = selectedStatuses.length === 0 || selectedStatuses.includes(deal.status)

    const matchesArchived = showArchived || !["Ganado", "Perdido"].includes(deal.status)

    return matchesSearch && matchesStatus && matchesArchived
  })

  const stats = {
    total: filteredDeals.length,
    active: filteredDeals.filter((d) => !["Ganado", "Perdido"].includes(d.status)).length,
    won: filteredDeals.filter((d) => d.status === "Ganado").length,
    lost: filteredDeals.filter((d) => d.status === "Perdido").length,
    totalValue: filteredDeals.reduce((sum, deal) => sum + (deal.value || 0), 0),
    avgQuality: filteredDeals.length
      ? filteredDeals.reduce((sum, deal) => sum + deal.quality_lead, 0) / filteredDeals.length
      : 0,
  }

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C28840] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando CRM...</p>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">CRM - Gestión de Leads</h1>
                <p className="text-gray-600">Sistema de gestión de clientes y oportunidades</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              {canEdit && (
                <Link href="/admin/crm/new">
                  <Button className="bg-[#C28840] hover:bg-[#8B5A2B]">
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Lead
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 space-y-6">
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Total Leads</p>
                    <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  </div>
                  <Building className="h-8 w-8 text-[#C28840]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Activos</p>
                    <p className="text-2xl font-bold text-blue-600">{stats.active}</p>
                  </div>
                  <User className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Ganados</p>
                    <p className="text-2xl font-bold text-green-600">{stats.won}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                    <span className="text-green-600 font-bold">✓</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Perdidos</p>
                    <p className="text-2xl font-bold text-red-600">{stats.lost}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <span className="text-red-600 font-bold">✗</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Valor Total</p>
                    <p className="text-lg font-bold text-[#C28840]">{formatCurrency(stats.totalValue)}</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-[#C28840]" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-600">Calidad Prom.</p>
                    <div className="flex items-center mt-1">
                      <QualityStars rating={Math.round(stats.avgQuality)} />
                      <span className="ml-2 text-sm text-gray-600">({stats.avgQuality.toFixed(1)})</span>
                    </div>
                  </div>
                  <Star className="h-8 w-8 text-yellow-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filtros y Búsqueda */}
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar por título, organización, contacto o email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="show-archived" checked={showArchived} onCheckedChange={setShowArchived} />
                    <Label htmlFor="show-archived" className="text-sm">
                      Mostrar archivados
                    </Label>
                  </div>

                  <Select value={viewMode} onValueChange={(value: "table" | "kanban") => setViewMode(value)}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="table">Tabla</SelectItem>
                      <SelectItem value="kanban">Kanban</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {DEAL_STATUSES.concat(["Ganado", "Perdido"]).map((status) => (
                  <Button
                    key={status}
                    variant={selectedStatuses.includes(status) ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleStatusFilter(status)}
                    className={selectedStatuses.includes(status) ? "bg-[#C28840] hover:bg-[#8B5A2B]" : ""}
                  >
                    {status}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Vista de Deals */}
          {viewMode === "kanban" ? (
            <KanbanView deals={filteredDeals} canEdit={canEdit} onDealUpdate={handleDealUpdate} />
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Leads ({filteredDeals.length})</CardTitle>
                <CardDescription>
                  {selectedStatuses.length > 0 && `Filtrado por: ${selectedStatuses.join(", ")}`}
                  {searchTerm && ` | Búsqueda: "${searchTerm}"`}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredDeals.length === 0 ? (
                  <div className="text-center py-12">
                    <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No hay leads</h3>
                    <p className="text-gray-500 mb-4">
                      {searchTerm || selectedStatuses.length > 0
                        ? "No se encontraron leads con los filtros aplicados"
                        : "Comienza agregando tu primer lead"}
                    </p>
                    {canEdit && (
                      <Link href="/admin/crm/new">
                        <Button className="bg-[#C28840] hover:bg-[#8B5A2B]">
                          <Plus className="h-4 w-4 mr-2" />
                          Crear Primer Lead
                        </Button>
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left p-3">Proyecto</th>
                          <th className="text-left p-3">Organización</th>
                          <th className="text-left p-3">Contacto</th>
                          <th className="text-left p-3">Estado</th>
                          <th className="text-left p-3">Valor</th>
                          <th className="text-left p-3">Calidad</th>
                          <th className="text-left p-3">Fecha</th>
                          <th className="text-left p-3">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredDeals.map((deal) => (
                          <tr key={deal.id} className="border-b hover:bg-gray-50">
                            <td className="p-3">
                              <div>
                                <div className="font-medium">{deal.title}</div>
                                {deal.proposal_type && (
                                  <div className="text-xs text-gray-500">{deal.proposal_type}</div>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center">
                                <Building className="h-4 w-4 text-gray-400 mr-2" />
                                {deal.organization || "Sin organización"}
                              </div>
                            </td>
                            <td className="p-3">
                              <div>
                                {deal.contact_name && (
                                  <div className="flex items-center">
                                    <User className="h-4 w-4 text-gray-400 mr-2" />
                                    {deal.contact_name}
                                  </div>
                                )}
                                {deal.contact_email && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Mail className="h-3 w-3 mr-1" />
                                    {deal.contact_email}
                                  </div>
                                )}
                                {deal.contact_phone && (
                                  <div className="flex items-center text-xs text-gray-500">
                                    <Phone className="h-3 w-3 mr-1" />
                                    {deal.contact_phone}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <Badge className={STATUS_COLORS[deal.status]}>{deal.status}</Badge>
                            </td>
                            <td className="p-3">
                              <div className="font-medium">{deal.value ? formatCurrency(deal.value) : "Sin valor"}</div>
                              {deal.margin && <div className="text-xs text-gray-500">Margen: {deal.margin}%</div>}
                            </td>
                            <td className="p-3">
                              <QualityStars rating={deal.quality_lead} />
                            </td>
                            <td className="p-3">
                              <div className="text-xs text-gray-500">
                                <div className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {new Date(deal.created_at).toLocaleDateString("es-CL")}
                                </div>
                                {deal.due_date && (
                                  <div className="text-red-600 mt-1">
                                    Vence: {new Date(deal.due_date).toLocaleDateString("es-CL")}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-3">
                              <div className="flex space-x-1">
                                <Link href={`/admin/crm/${deal.id}`}>
                                  <Button size="sm" variant="outline">
                                    <Eye className="h-3 w-3" />
                                  </Button>
                                </Link>
                                {canEdit && (
                                  <>
                                    <Link href={`/admin/crm/${deal.id}`}>
                                      <Button size="sm" variant="outline">
                                        <Edit className="h-3 w-3" />
                                      </Button>
                                    </Link>
                                    {["Ganado", "Perdido"].includes(deal.status) ? (
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-orange-600 hover:text-orange-700"
                                      >
                                        <RotateCcw className="h-3 w-3" />
                                      </Button>
                                    ) : (
                                      <Button size="sm" variant="outline" className="text-gray-600 hover:text-gray-700">
                                        <Archive className="h-3 w-3" />
                                      </Button>
                                    )}
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
