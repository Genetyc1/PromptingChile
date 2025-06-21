"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Building, User, Mail, Phone, Calendar, DollarSign, Star, Eye, Edit } from "lucide-react"
import Link from "next/link"
import type { Deal, DealStatus } from "@/app/types/crm"

const DEAL_STATUSES: DealStatus[] = [
  "Prospección General",
  "Prospección Contingente",
  "Estudio",
  "Entregadas",
  "Negociación",
]

const STATUS_COLORS = {
  "Prospección General": "bg-gray-100 text-gray-800 border-gray-300",
  "Prospección Contingente": "bg-blue-100 text-blue-800 border-blue-300",
  Estudio: "bg-yellow-100 text-yellow-800 border-yellow-300",
  Entregadas: "bg-purple-100 text-purple-800 border-purple-300",
  Negociación: "bg-orange-100 text-orange-800 border-orange-300",
  Ganado: "bg-green-100 text-green-800 border-green-300",
  Perdido: "bg-red-100 text-red-800 border-red-300",
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
        <Star key={star} className={`h-3 w-3 ${star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"}`} />
      ))}
    </div>
  )
}

interface KanbanViewProps {
  deals: Deal[]
  canEdit: boolean
  onDealUpdate: (dealId: string, newStatus: DealStatus) => void
}

export default function KanbanView({ deals, canEdit, onDealUpdate }: KanbanViewProps) {
  const [draggedDeal, setDraggedDeal] = useState<Deal | null>(null)

  const handleDragStart = (e: React.DragEvent, deal: Deal) => {
    setDraggedDeal(deal)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDrop = async (e: React.DragEvent, newStatus: DealStatus) => {
    e.preventDefault()
    if (!draggedDeal || !canEdit) return

    if (draggedDeal.status !== newStatus) {
      await onDealUpdate(draggedDeal.id, newStatus)
    }
    setDraggedDeal(null)
  }

  const getDealsForStatus = (status: DealStatus) => {
    return deals.filter((deal) => deal.status === status)
  }

  const getColumnTotal = (status: DealStatus) => {
    return getDealsForStatus(status).reduce((sum, deal) => sum + (deal.value || 0), 0)
  }

  return (
    <div className="flex space-x-6 overflow-x-auto pb-6">
      {DEAL_STATUSES.map((status) => {
        const statusDeals = getDealsForStatus(status)
        const columnTotal = getColumnTotal(status)

        return (
          <div
            key={status}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className={`rounded-lg border-2 ${STATUS_COLORS[status]} mb-4 p-3`}>
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-sm">{status}</h3>
                <Badge variant="secondary" className="text-xs">
                  {statusDeals.length}
                </Badge>
              </div>
              {columnTotal > 0 && (
                <div className="text-xs font-medium text-gray-600">{formatCurrency(columnTotal)}</div>
              )}
            </div>

            <div className="space-y-3 min-h-[200px]">
              {statusDeals.map((deal) => (
                <Card
                  key={deal.id}
                  className="cursor-move hover:shadow-md transition-shadow"
                  draggable={canEdit}
                  onDragStart={(e) => handleDragStart(e, deal)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-2 flex-1">{deal.title}</h4>
                        <div className="flex items-center ml-2">
                          <QualityStars rating={deal.quality_lead} />
                        </div>
                      </div>

                      {/* Organization */}
                      {deal.organization && (
                        <div className="flex items-center text-xs text-gray-600">
                          <Building className="h-3 w-3 mr-1" />
                          <span className="truncate">{deal.organization}</span>
                        </div>
                      )}

                      {/* Contact Info */}
                      {deal.contact_name && (
                        <div className="flex items-center text-xs text-gray-600">
                          <User className="h-3 w-3 mr-1" />
                          <span className="truncate">{deal.contact_name}</span>
                        </div>
                      )}

                      {deal.contact_email && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Mail className="h-3 w-3 mr-1" />
                          <span className="truncate">{deal.contact_email}</span>
                        </div>
                      )}

                      {deal.contact_phone && (
                        <div className="flex items-center text-xs text-gray-500">
                          <Phone className="h-3 w-3 mr-1" />
                          <span className="truncate">{deal.contact_phone}</span>
                        </div>
                      )}

                      {/* Value */}
                      {deal.value && deal.value > 0 && (
                        <div className="flex items-center text-sm font-semibold text-[#C28840]">
                          <DollarSign className="h-3 w-3 mr-1" />
                          {formatCurrency(deal.value)}
                        </div>
                      )}

                      {/* Dates */}
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(deal.created_at).toLocaleDateString("es-CL")}
                        </div>
                        {deal.due_date && (
                          <div className="text-red-600 font-medium">
                            Vence: {new Date(deal.due_date).toLocaleDateString("es-CL")}
                          </div>
                        )}
                      </div>

                      {/* Proposal Type */}
                      {deal.proposal_type && (
                        <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{deal.proposal_type}</div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <div className="flex items-center space-x-1">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {deal.contact_name ? deal.contact_name.charAt(0).toUpperCase() : "?"}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex space-x-1">
                          <Link href={`/admin/crm/${deal.id}`}>
                            <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                              <Eye className="h-3 w-3" />
                            </Button>
                          </Link>
                          {canEdit && (
                            <Link href={`/admin/crm/${deal.id}`}>
                              <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                <Edit className="h-3 w-3" />
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {statusDeals.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <div className="text-sm">No hay leads en esta etapa</div>
                  {canEdit && <div className="text-xs mt-1">Arrastra un lead aquí para moverlo</div>}
                </div>
              )}
            </div>
          </div>
        )
      })}

      {/* Archived Column */}
      <div className="flex-shrink-0 w-80">
        <div className="rounded-lg border-2 bg-gray-100 text-gray-800 border-gray-300 mb-4 p-3">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-sm">Archivados</h3>
            <Badge variant="secondary" className="text-xs">
              {deals.filter((d) => ["Ganado", "Perdido"].includes(d.status)).length}
            </Badge>
          </div>
        </div>

        <div className="space-y-3 min-h-[200px]">
          {deals
            .filter((deal) => ["Ganado", "Perdido"].includes(deal.status))
            .map((deal) => (
              <Card key={deal.id} className="opacity-75">
                <CardContent className="p-4">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <h4 className="font-medium text-sm line-clamp-2 flex-1">{deal.title}</h4>
                      <Badge className={STATUS_COLORS[deal.status]} variant="secondary">
                        {deal.status}
                      </Badge>
                    </div>

                    {deal.organization && (
                      <div className="flex items-center text-xs text-gray-600">
                        <Building className="h-3 w-3 mr-1" />
                        <span className="truncate">{deal.organization}</span>
                      </div>
                    )}

                    {deal.value && deal.value > 0 && (
                      <div className="flex items-center text-sm font-semibold text-[#C28840]">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {formatCurrency(deal.value)}
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-2 border-t">
                      <div className="text-xs text-gray-500">
                        {new Date(deal.updated_at).toLocaleDateString("es-CL")}
                      </div>
                      <Link href={`/admin/crm/${deal.id}`}>
                        <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                          <Eye className="h-3 w-3" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
