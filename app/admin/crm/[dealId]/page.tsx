"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ArrowLeft,
  Save,
  CheckCircle,
  XCircle,
  Upload,
  MessageSquare,
  User,
  FileText,
  Clock,
  Trash2,
  Mail,
  Phone,
  Calendar,
  Plus,
  Check,
  X,
  RotateCcw,
} from "lucide-react"
import Link from "next/link"
import type { Deal, DealNote, DealStatusHistory, DealStatus, Activity, ActivityType } from "@/app/types/crm"

const DEAL_STATUSES: DealStatus[] = [
  "Prospección General",
  "Prospección Contingente",
  "Estudio",
  "Entregadas",
  "Negociación",
]

const ACTIVITY_TYPES: { value: ActivityType; label: string; icon: any }[] = [
  { value: "call", label: "Llamada", icon: Phone },
  { value: "email", label: "Email", icon: Mail },
  { value: "meeting", label: "Reunión", icon: Calendar },
  { value: "task", label: "Tarea", icon: FileText },
  { value: "follow_up", label: "Seguimiento", icon: Clock },
  { value: "demo", label: "Demo", icon: Upload },
  { value: "proposal", label: "Propuesta", icon: MessageSquare },
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

const ACTIVITY_STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    minimumFractionDigits: 0,
  }).format(value)
}

function StatusTimeline({ deal, history }: { deal: Deal; history: DealStatusHistory[] }) {
  const allStatuses = [...DEAL_STATUSES, "Ganado", "Perdido"]
  const currentStatusIndex = allStatuses.indexOf(deal.status)

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Timeline de Estado</h3>
      <div className="relative">
        {allStatuses.map((status, index) => {
          const isCompleted = index <= currentStatusIndex
          const isCurrent = index === currentStatusIndex
          const historyItem = history.find((h) => h.new_status === status)

          return (
            <div key={status} className="flex items-center mb-4">
              <div className="flex items-center">
                <div
                  className={`w-4 h-4 rounded-full border-2 ${
                    isCompleted
                      ? "bg-[#C28840] border-[#C28840]"
                      : isCurrent
                        ? "bg-white border-[#C28840]"
                        : "bg-white border-gray-300"
                  }`}
                />
                {index < allStatuses.length - 1 && (
                  <div
                    className={`w-px h-8 ml-2 ${isCompleted ? "bg-[#C28840]" : "bg-gray-300"}`}
                    style={{ marginTop: "1rem" }}
                  />
                )}
              </div>
              <div className="ml-4 flex-1">
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${isCurrent ? "text-[#C28840]" : "text-gray-700"}`}>{status}</span>
                  {historyItem && (
                    <span className="text-sm text-gray-500">
                      {new Date(historyItem.changed_at).toLocaleDateString("es-CL")}
                    </span>
                  )}
                </div>
                {historyItem?.notes && <p className="text-sm text-gray-600 mt-1">{historyItem.notes}</p>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ActivitiesSection({
  dealId,
  activities,
  onRefresh,
}: {
  dealId: string
  activities: Activity[]
  onRefresh: () => void
}) {
  const [showNewActivity, setShowNewActivity] = useState(false)
  const [newActivity, setNewActivity] = useState({
    title: "",
    description: "",
    type: "call" as ActivityType,
    scheduled_date: "",
    scheduled_time: "",
  })
  const [isAdding, setIsAdding] = useState(false)

  const handleAddActivity = async () => {
    if (!newActivity.title.trim() || !newActivity.scheduled_date) return

    try {
      setIsAdding(true)
      const response = await fetch(`/api/admin/crm/deals/${dealId}/activities`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newActivity),
      })

      if (response.ok) {
        setNewActivity({
          title: "",
          description: "",
          type: "call",
          scheduled_date: "",
          scheduled_time: "",
        })
        setShowNewActivity(false)
        onRefresh()
      } else {
        console.error("Error response:", await response.text())
      }
    } catch (error) {
      console.error("Error adding activity:", error)
    } finally {
      setIsAdding(false)
    }
  }

  const handleCompleteActivity = async (activityId: string) => {
    try {
      const response = await fetch(`/api/admin/crm/activities/${activityId}/complete`, {
        method: "PUT",
      })

      if (response.ok) {
        onRefresh()
      }
    } catch (error) {
      console.error("Error completing activity:", error)
    }
  }

  const getActivityIcon = (type: ActivityType) => {
    const activityType = ACTIVITY_TYPES.find((t) => t.value === type)
    const Icon = activityType?.icon || FileText
    return <Icon className="h-4 w-4" />
  }

  const getActivityStatus = (activity: Activity) => {
    const today = new Date().toISOString().split("T")[0]
    const activityDate = activity.scheduled_date

    if (activity.status === "completed") return "completed"
    if (activity.status === "cancelled") return "cancelled"
    if (activityDate < today) return "overdue"
    if (activityDate === today) return "today"
    return "upcoming"
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Actividades y Seguimiento
        </h3>
        <Button onClick={() => setShowNewActivity(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Actividad
        </Button>
      </div>

      {showNewActivity && (
        <Card className="border-2 border-[#C28840]">
          <CardContent className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="activity-title">Título *</Label>
                <Input
                  id="activity-title"
                  value={newActivity.title}
                  onChange={(e) => setNewActivity({ ...newActivity, title: e.target.value })}
                  placeholder="Ej: Llamada de seguimiento"
                />
              </div>
              <div>
                <Label htmlFor="activity-type">Tipo</Label>
                <Select
                  value={newActivity.type}
                  onValueChange={(value: ActivityType) => setNewActivity({ ...newActivity, type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTIVITY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center">
                          <type.icon className="h-4 w-4 mr-2" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="activity-date">Fecha *</Label>
                <Input
                  id="activity-date"
                  type="date"
                  value={newActivity.scheduled_date}
                  onChange={(e) => setNewActivity({ ...newActivity, scheduled_date: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="activity-time">Hora</Label>
                <Input
                  id="activity-time"
                  type="time"
                  value={newActivity.scheduled_time}
                  onChange={(e) => setNewActivity({ ...newActivity, scheduled_time: e.target.value })}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="activity-description">Descripción</Label>
              <Textarea
                id="activity-description"
                value={newActivity.description}
                onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                placeholder="Detalles adicionales de la actividad..."
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowNewActivity(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAddActivity}
                disabled={isAdding || !newActivity.title.trim() || !newActivity.scheduled_date}
              >
                {isAdding ? "Agregando..." : "Agregar Actividad"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay actividades registradas</p>
        ) : (
          activities.map((activity) => {
            const status = getActivityStatus(activity)
            const statusColor =
              status === "overdue"
                ? "border-red-500 bg-red-50"
                : status === "today"
                  ? "border-yellow-500 bg-yellow-50"
                  : status === "completed"
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200 bg-white"

            return (
              <div key={activity.id} className={`border rounded-lg p-3 ${statusColor}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center">
                    {getActivityIcon(activity.type)}
                    <span className="font-medium ml-2">{activity.title}</span>
                    <Badge className={`ml-2 ${ACTIVITY_STATUS_COLORS[activity.status]}`}>
                      {activity.status === "pending"
                        ? "Pendiente"
                        : activity.status === "completed"
                          ? "Completada"
                          : "Cancelada"}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-500">
                      {new Date(activity.scheduled_date).toLocaleDateString("es-CL")}
                      {activity.scheduled_time && ` ${activity.scheduled_time}`}
                    </span>
                    {activity.status === "pending" && (
                      <Button size="sm" variant="outline" onClick={() => handleCompleteActivity(activity.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                {activity.description && <p className="text-sm text-gray-600 mt-1">{activity.description}</p>}
                <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                  <span>{ACTIVITY_TYPES.find((t) => t.value === activity.type)?.label}</span>
                  <span>Creado: {new Date(activity.created_at).toLocaleDateString("es-CL")}</span>
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function NotesSection({ dealId, notes, onAddNote }: { dealId: string; notes: DealNote[]; onAddNote: () => void }) {
  const [newNote, setNewNote] = useState("")
  const [isAdding, setIsAdding] = useState(false)

  const handleAddNote = async () => {
    if (!newNote.trim()) return

    try {
      setIsAdding(true)
      const response = await fetch(`/api/admin/crm/deals/${dealId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newNote }),
      })

      if (response.ok) {
        setNewNote("")
        onAddNote()
      } else {
        console.error("Error response:", await response.text())
      }
    } catch (error) {
      console.error("Error adding note:", error)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg flex items-center">
        <MessageSquare className="h-5 w-5 mr-2" />
        Notas y Comentarios
      </h3>

      <div className="space-y-2">
        <Textarea
          placeholder="Agregar nueva nota..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          rows={3}
        />
        <Button onClick={handleAddNote} disabled={isAdding || !newNote.trim()} size="sm">
          {isAdding ? "Agregando..." : "Agregar Nota"}
        </Button>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {notes.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No hay notas registradas</p>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="bg-gray-50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-sm">Usuario</span>
                <span className="text-xs text-gray-500">{new Date(note.created_at).toLocaleString("es-CL")}</span>
              </div>
              <p className="text-sm text-gray-700">{note.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function EmailModal({ deal, isOpen, onClose }: { deal: Deal; isOpen: boolean; onClose: () => void }) {
  const [email, setEmail] = useState({
    to: deal.contact_email || "",
    subject: `Seguimiento - ${deal.title}`,
    content: "",
  })
  const [showPreview, setShowPreview] = useState(true)
  const [isSending, setIsSending] = useState(false)

  const handleSend = async () => {
    if (!email.to || !email.subject || !email.content) return

    try {
      setIsSending(true)
      const response = await fetch(`/api/admin/crm/deals/${deal.id}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(email),
      })

      if (response.ok) {
        onClose()
        // Agregar actividad de email automáticamente
        await fetch(`/api/admin/crm/deals/${deal.id}/activities`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Email enviado: ${email.subject}`,
            description: email.content.substring(0, 200) + "...",
            type: "email",
            scheduled_date: new Date().toISOString().split("T")[0],
            status: "completed",
          }),
        })
      } else {
        console.error("Error response:", await response.text())
      }
    } catch (error) {
      console.error("Error sending email:", error)
    } finally {
      setIsSending(false)
    }
  }

  if (!isOpen) return null

  const emailPreview = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
      <div style="background: #C28840; color: white; padding: 20px; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">Prompting Chile</h1>
        <p style="margin: 5px 0 0 0; opacity: 0.9;">AI Solutions</p>
      </div>
      <div style="padding: 30px 20px;">
        <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
${email.content}
        </div>
      </div>
      <div style="background: #f8f9fa; padding: 20px; border-top: 1px solid #e9ecef;">
        <div style="text-align: center; color: #666; font-size: 14px;">
          <p style="margin: 0 0 10px 0;"><strong>Prompting Chile</strong></p>
          <p style="margin: 0 0 5px 0;">Soluciones de IA para empresas</p>
          <p style="margin: 0 0 10px 0;">📧 contacto@promptingchile.cl</p>
          <p style="margin: 0;">
            <a href="https://www.promptingchile.cl" style="color: #C28840; text-decoration: none;">www.promptingchile.cl</a>
          </p>
        </div>
      </div>
    </div>
  `

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <h3 className="text-lg font-semibold">Enviar Correo</h3>
          <Button variant="ghost" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex h-[calc(90vh-180px)]">
          {/* Editor */}
          <div className="flex-1 p-6 space-y-4 overflow-y-auto">
            <div>
              <Label htmlFor="email-to">Para</Label>
              <Input
                id="email-to"
                type="email"
                value={email.to}
                onChange={(e) => setEmail({ ...email, to: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email-subject">Asunto</Label>
              <Input
                id="email-subject"
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email-content">Contenido</Label>
              <Textarea
                id="email-content"
                value={email.content}
                onChange={(e) => setEmail({ ...email, content: e.target.value })}
                rows={15}
                placeholder="Escribe tu mensaje aquí..."
              />
            </div>
          </div>

          {/* Preview */}
          <div className="w-1/2 border-l bg-gray-50">
            <div className="p-4 border-b bg-white">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Vista Previa</h4>
                <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)}>
                  {showPreview ? "Ocultar" : "Mostrar"}
                </Button>
              </div>
            </div>
            {showPreview && (
              <div className="p-4 overflow-y-auto h-full">
                <div dangerouslySetInnerHTML={{ __html: emailPreview }} />
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-2 p-6 border-t bg-gray-50">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSend} disabled={isSending || !email.to || !email.subject || !email.content}>
            {isSending ? "Enviando..." : "Enviar Correo"}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function DealDetailPage({ params }: { params: { dealId: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [deal, setDeal] = useState<Deal | null>(null)
  const [notes, setNotes] = useState<DealNote[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [history, setHistory] = useState<DealStatusHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showWonLostModal, setShowWonLostModal] = useState<"won" | "lost" | null>(null)
  const [wonLostReason, setWonLostReason] = useState("")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showEmailModal, setShowEmailModal] = useState(false)

  const userRole = session?.user?.role as string
  const canEdit = ["admin", "owner"].includes(userRole)

  useEffect(() => {
    loadDealData()
  }, [params.dealId])

  const loadDealData = async () => {
    try {
      setLoading(true)
      const [dealRes, notesRes, activitiesRes, historyRes] = await Promise.all([
        fetch(`/api/admin/crm/deals/${params.dealId}`),
        fetch(`/api/admin/crm/deals/${params.dealId}/notes`),
        fetch(`/api/admin/crm/deals/${params.dealId}/activities`),
        fetch(`/api/admin/crm/deals/${params.dealId}/history`),
      ])

      if (dealRes.ok) {
        const dealData = await dealRes.json()
        setDeal(dealData.deal)
      }

      if (notesRes.ok) {
        const notesData = await notesRes.json()
        setNotes(notesData.notes || [])
      }

      if (activitiesRes.ok) {
        const activitiesData = await activitiesRes.json()
        setActivities(activitiesData.activities || [])
      }

      if (historyRes.ok) {
        const historyData = await historyRes.json()
        setHistory(historyData.history || [])
      }
    } catch (error) {
      console.error("Error loading deal data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!deal || !canEdit) return

    try {
      setSaving(true)
      const response = await fetch(`/api/admin/crm/deals/${params.dealId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(deal),
      })

      if (response.ok) {
        const updatedDeal = await response.json()
        setDeal(updatedDeal.deal)
      }
    } catch (error) {
      console.error("Error saving deal:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deal || !canEdit) return

    try {
      const response = await fetch(`/api/admin/crm/deals/${params.dealId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        router.push("/admin/crm")
      }
    } catch (error) {
      console.error("Error deleting deal:", error)
    }
  }

  const handleReopen = async () => {
    if (!deal || !canEdit) return

    try {
      const response = await fetch(`/api/admin/crm/deals/${params.dealId}/reopen`, {
        method: "PUT",
      })

      if (response.ok) {
        loadDealData()
      }
    } catch (error) {
      console.error("Error reopening deal:", error)
    }
  }

  const handleWonLost = async (status: "Ganado" | "Perdido") => {
    if (!deal || !canEdit || !wonLostReason.trim()) return

    try {
      const response = await fetch(`/api/admin/crm/deals/${params.dealId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reason: wonLostReason,
        }),
      })

      if (response.ok) {
        setShowWonLostModal(null)
        setWonLostReason("")
        loadDealData()
      }
    } catch (error) {
      console.error("Error updating deal status:", error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#C28840] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando deal...</p>
        </div>
      </div>
    )
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Deal no encontrado</h2>
          <Link href="/admin/crm">
            <Button>Volver al CRM</Button>
          </Link>
        </div>
      </div>
    )
  }

  const isArchived = ["Ganado", "Perdido"].includes(deal.status)

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
                <h1 className="text-3xl font-bold text-gray-900">{deal.title}</h1>
                <div className="flex items-center mt-2 space-x-4">
                  <Badge className={STATUS_COLORS[deal.status]}>{deal.status}</Badge>
                  {deal.value > 0 && (
                    <span className="text-lg font-semibold text-[#C28840]">{formatCurrency(deal.value)}</span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <>
                  <Button
                    onClick={() => setShowEmailModal(true)}
                    size="sm"
                    variant="outline"
                    className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Enviar Correo
                  </Button>
                  <Button onClick={() => setShowDeleteModal(true)} size="sm" variant="destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </>
              )}
              {canEdit && isArchived && (
                <Button
                  onClick={handleReopen}
                  size="sm"
                  variant="outline"
                  className="border-orange-500 text-orange-600"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reabrir
                </Button>
              )}
              {canEdit && !isArchived && (
                <>
                  <Button
                    onClick={() => setShowWonLostModal("won")}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Ganado
                  </Button>
                  <Button onClick={() => setShowWonLostModal("lost")} size="sm" variant="destructive">
                    <XCircle className="h-4 w-4 mr-2" />
                    Perdido
                  </Button>
                </>
              )}
              {canEdit && (
                <Button onClick={handleSave} disabled={saving} className="bg-[#C28840] hover:bg-[#8B5A2B]">
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Guardando..." : "Guardar"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información Principal */}
            <div className="lg:col-span-2 space-y-6">
              {/* Información del Proyecto */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Información del Proyecto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Título del Proyecto</Label>
                      <Input
                        id="title"
                        value={deal.title}
                        onChange={(e) => setDeal({ ...deal, title: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="organization">Organización</Label>
                      <Input
                        id="organization"
                        value={deal.organization || ""}
                        onChange={(e) => setDeal({ ...deal, organization: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="value">Valor (CLP)</Label>
                      <Input
                        id="value"
                        type="number"
                        value={deal.value}
                        onChange={(e) => setDeal({ ...deal, value: Number.parseInt(e.target.value) || 0 })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        value={deal.status}
                        onValueChange={(value: DealStatus) => setDeal({ ...deal, status: value })}
                        disabled={!canEdit || isArchived}
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
                      <Label htmlFor="margin">Margen (%)</Label>
                      <Input
                        id="margin"
                        type="number"
                        step="0.01"
                        value={deal.margin || ""}
                        onChange={(e) => setDeal({ ...deal, margin: Number.parseFloat(e.target.value) || undefined })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quality_lead">Calidad del Lead (1-5)</Label>
                      <Select
                        value={deal.quality_lead.toString()}
                        onValueChange={(value) => setDeal({ ...deal, quality_lead: Number.parseInt(value) })}
                        disabled={!canEdit}
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
                      <Label htmlFor="proposal_type">Tipo de Propuesta</Label>
                      <Input
                        id="proposal_type"
                        value={deal.proposal_type || ""}
                        onChange={(e) => setDeal({ ...deal, proposal_type: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="channel">Canal</Label>
                      <Input
                        id="channel"
                        value={deal.channel || ""}
                        onChange={(e) => setDeal({ ...deal, channel: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="due_date">Fecha de Vencimiento</Label>
                      <Input
                        id="due_date"
                        type="date"
                        value={deal.due_date || ""}
                        onChange={(e) => setDeal({ ...deal, due_date: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="delivery_date">Fecha de Entrega</Label>
                      <Input
                        id="delivery_date"
                        type="date"
                        value={deal.delivery_date || ""}
                        onChange={(e) => setDeal({ ...deal, delivery_date: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notas</Label>
                    <Textarea
                      id="notes"
                      value={deal.notes || ""}
                      onChange={(e) => setDeal({ ...deal, notes: e.target.value })}
                      disabled={!canEdit}
                      rows={3}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Información de Contacto */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Información de Contacto
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="contact_name">Nombre del Contacto</Label>
                      <Input
                        id="contact_name"
                        value={deal.contact_name || ""}
                        onChange={(e) => setDeal({ ...deal, contact_name: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_email">Email</Label>
                      <Input
                        id="contact_email"
                        type="email"
                        value={deal.contact_email || ""}
                        onChange={(e) => setDeal({ ...deal, contact_email: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                    <div>
                      <Label htmlFor="contact_phone">Teléfono</Label>
                      <Input
                        id="contact_phone"
                        value={deal.contact_phone || ""}
                        onChange={(e) => setDeal({ ...deal, contact_phone: e.target.value })}
                        disabled={!canEdit}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Actividades y Seguimiento */}
              <Card>
                <CardContent className="p-6">
                  <ActivitiesSection dealId={params.dealId} activities={activities} onRefresh={loadDealData} />
                </CardContent>
              </Card>

              {/* Notas y Comentarios */}
              <Card>
                <CardContent className="p-6">
                  <NotesSection dealId={params.dealId} notes={notes} onAddNote={loadDealData} />
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Timeline de Estado */}
              <Card>
                <CardContent className="p-6">
                  <StatusTimeline deal={deal} history={history} />
                </CardContent>
              </Card>

              {/* Archivos Adjuntos */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Upload className="h-5 w-5 mr-2" />
                    Archivos Adjuntos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" className="w-full">
                      <Upload className="h-4 w-4 mr-2" />
                      Subir Archivo
                    </Button>
                    <p className="text-sm text-gray-500 text-center">No hay archivos adjuntos</p>
                  </div>
                </CardContent>
              </Card>

              {/* Información Adicional */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    Información Adicional
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Creado:</span>
                    <span>{new Date(deal.created_at).toLocaleDateString("es-CL")}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Actualizado:</span>
                    <span>{new Date(deal.updated_at).toLocaleDateString("es-CL")}</span>
                  </div>
                  {deal.reason && (
                    <div className="pt-2 border-t">
                      <span className="text-sm font-medium text-gray-600">Razón:</span>
                      <p className="text-sm text-gray-900 mt-1">{deal.reason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Won/Lost */}
      {showWonLostModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">
              Marcar como {showWonLostModal === "won" ? "Ganado" : "Perdido"}
            </h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="reason">Razón (obligatorio)</Label>
                <Textarea
                  id="reason"
                  value={wonLostReason}
                  onChange={(e) => setWonLostReason(e.target.value)}
                  placeholder={`¿Por qué se ${showWonLostModal === "won" ? "ganó" : "perdió"} este deal?`}
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowWonLostModal(null)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleWonLost(showWonLostModal === "won" ? "Ganado" : "Perdido")}
                  disabled={!wonLostReason.trim()}
                  className={showWonLostModal === "won" ? "bg-green-600 hover:bg-green-700" : ""}
                  variant={showWonLostModal === "lost" ? "destructive" : "default"}
                >
                  Confirmar
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Delete */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Eliminar Deal Permanentemente</h3>
            <div className="space-y-4">
              <p className="text-gray-700">
                ¿Estás seguro de que quieres eliminar este deal permanentemente? Esta acción no se puede deshacer.
              </p>
              <p className="text-sm text-gray-500">
                Se eliminarán también todas las notas, actividades e historial asociados.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  Eliminar Permanentemente
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Email */}
      <EmailModal deal={deal} isOpen={showEmailModal} onClose={() => setShowEmailModal(false)} />
    </div>
  )
}
