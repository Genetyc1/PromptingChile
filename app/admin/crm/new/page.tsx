"use client"

import type React from "react"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import type { DealStatus } from "@/app/types/crm"

const DEAL_STATUSES: DealStatus[] = [
  "Prospección General",
  "Prospección Contingente",
  "Estudio",
  "Entregadas",
  "Negociación",
]

export default function NewDealPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    status: "Prospección General" as DealStatus,
    value: 0,
    quality_lead: 3,
    margin: 0,
    proposal_type: "",
    channel: "Manual",
    due_date: "",
    delivery_date: "",
    notes: "",
  })

  const userRole = session?.user?.role as string
  const canEdit = ["admin", "owner"].includes(userRole)

  if (!canEdit) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Acceso Denegado</h2>
          <p className="text-gray-600 mb-4">No tienes permisos para crear deals</p>
          <Link href="/admin/crm">
            <Button>Volver al CRM</Button>
          </Link>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      setError("El título es requerido")
      return
    }

    try {
      setSaving(true)
      setError(null)

      console.log("🔥 Submitting form data:", formData)

      const response = await fetch("/api/admin/crm/deals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("🔥 Response status:", response.status)

      const result = await response.json()
      console.log("🔥 Response data:", result)

      if (response.ok && result.success) {
        console.log("✅ Deal created successfully, redirecting to:", `/admin/crm/${result.deal.id}`)
        router.push(`/admin/crm/${result.deal.id}`)
      } else {
        console.log("❌ Error creating deal:", result.error)
        setError(result.error || "Error al crear el lead")
      }
    } catch (error) {
      console.error("❌ Network error:", error)
      setError("Error de conexión. Intenta nuevamente.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin/crm">
                <Button variant="ghost" size="sm" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver al CRM
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Nuevo Deal</h1>
                <p className="text-gray-600">Crear una nueva oportunidad de negocio</p>
              </div>
            </div>
            <Button
              onClick={handleSubmit}
              disabled={saving || !formData.title.trim()}
              className="bg-[#C28840] hover:bg-[#8B5A2B]"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Creando..." : "Crear Deal"}
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información Principal */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2" />
                  Información del Deal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Título del Deal *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Ej: Implementación CRM para empresa X"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="organization">Organización</Label>
                    <Input
                      id="organization"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Nombre de la empresa"
                    />
                  </div>
                  <div>
                    <Label htmlFor="value">Valor (CLP)</Label>
                    <Input
                      id="value"
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: Number.parseInt(e.target.value) || 0 })}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Estado Inicial</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: DealStatus) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {DEAL_STATUSES.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="quality_lead">Calidad del Lead (1-5)</Label>
                    <Select
                      value={formData.quality_lead.toString()}
                      onValueChange={(value) => setFormData({ ...formData, quality_lead: Number.parseInt(value) })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map((num) => (
                          <SelectItem key={num} value={num.toString()}>
                            {num} estrella{num > 1 ? "s" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="channel">Canal</Label>
                    <Select
                      value={formData.channel}
                      onValueChange={(value) => setFormData({ ...formData, channel: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manual">Manual</SelectItem>
                        <SelectItem value="Formulario Web">Formulario Web</SelectItem>
                        <SelectItem value="Referido">Referido</SelectItem>
                        <SelectItem value="LinkedIn">LinkedIn</SelectItem>
                        <SelectItem value="Email">Email</SelectItem>
                        <SelectItem value="Teléfono">Teléfono</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Información de Contacto */}
            <Card>
              <CardHeader>
                <CardTitle>Información de Contacto</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="contact_name">Nombre del Contacto</Label>
                    <Input
                      id="contact_name"
                      value={formData.contact_name}
                      onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                      placeholder="Nombre completo"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_email">Email</Label>
                    <Input
                      id="contact_email"
                      type="email"
                      value={formData.contact_email}
                      onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                      placeholder="email@empresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact_phone">Teléfono</Label>
                    <Input
                      id="contact_phone"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                      placeholder="+56 9 1234 5678"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Detalles Adicionales */}
            <Card>
              <CardHeader>
                <CardTitle>Detalles Adicionales</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="margin">Margen (%)</Label>
                    <Input
                      id="margin"
                      type="number"
                      step="0.01"
                      value={formData.margin}
                      onChange={(e) => setFormData({ ...formData, margin: Number.parseFloat(e.target.value) || 0 })}
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <Label htmlFor="due_date">Fecha de Vencimiento</Label>
                    <Input
                      id="due_date"
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="delivery_date">Fecha de Entrega</Label>
                    <Input
                      id="delivery_date"
                      type="date"
                      value={formData.delivery_date}
                      onChange={(e) => setFormData({ ...formData, delivery_date: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="proposal_type">Tipo de Propuesta</Label>
                  <Input
                    id="proposal_type"
                    value={formData.proposal_type}
                    onChange={(e) => setFormData({ ...formData, proposal_type: e.target.value })}
                    placeholder="Ej: Desarrollo personalizado, Consultoría, etc."
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notas Iniciales</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Información adicional sobre el deal..."
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </div>
  )
}
