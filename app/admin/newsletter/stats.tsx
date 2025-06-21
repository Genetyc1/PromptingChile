"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, UserCheck, UserX, TrendingUp, RefreshCw } from "lucide-react"

interface SubscriberStats {
  total: number
  active: number
  unsubscribed: number
  newThisMonth: number
}

export default function NewsletterStats() {
  const [stats, setStats] = useState<SubscriberStats>({
    total: 0,
    active: 0,
    unsubscribed: 0,
    newThisMonth: 0,
  })
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchStats = async () => {
    try {
      setLoading(true)
      console.log("📊 Obteniendo estadísticas de suscriptores...")

      const response = await fetch("/api/debug/subscribers")

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      if (data.status === "success" && data.statistics) {
        setStats(data.statistics)
        setLastUpdated(new Date())
        console.log("✅ Estadísticas actualizadas:", data.statistics)
      } else {
        console.warn("⚠️ No se pudieron obtener estadísticas:", data.message)
      }
    } catch (error) {
      console.error("❌ Error al cargar estadísticas:", error)
      // Mantener estadísticas en 0 en caso de error
      setStats({
        total: 0,
        active: 0,
        unsubscribed: 0,
        newThisMonth: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  const formatLastUpdated = () => {
    if (!lastUpdated) return "Nunca"
    try {
      return lastUpdated.toLocaleTimeString("es-ES", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    } catch {
      return "Error en formato"
    }
  }

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-white">Estadísticas de Suscriptores</h2>
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span>Última actualización: {formatLastUpdated()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Suscriptores</CardTitle>
            <Users className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? "..." : stats.total.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Todos los suscriptores registrados</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Suscriptores Activos</CardTitle>
            <UserCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{loading ? "..." : stats.active.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Recibirán el newsletter</p>
            {stats.total > 0 && (
              <Badge variant="outline" className="mt-2 text-xs border-green-800 text-green-400">
                {Math.round((stats.active / stats.total) * 100)}% del total
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Desuscritos</CardTitle>
            <UserX className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-400">
              {loading ? "..." : stats.unsubscribed.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">No recibirán emails</p>
            {stats.total > 0 && (
              <Badge variant="outline" className="mt-2 text-xs border-red-800 text-red-400">
                {Math.round((stats.unsubscribed / stats.total) * 100)}% del total
              </Badge>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Nuevos Este Mes</CardTitle>
            <TrendingUp className="h-4 w-4 text-[#C28840]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-[#C28840]">
              {loading ? "..." : stats.newThisMonth.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Suscriptores de {new Date().toLocaleDateString("es-ES", { month: "long" })}
            </p>
            {stats.total > 0 && (
              <Badge variant="outline" className="mt-2 text-xs border-[#C28840] text-[#C28840]">
                {Math.round((stats.newThisMonth / stats.total) * 100)}% del total
              </Badge>
            )}
          </CardContent>
        </Card>
      </div>

      {loading && (
        <div className="text-center text-gray-400 mt-4">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto mb-2" />
          Cargando estadísticas...
        </div>
      )}
    </div>
  )
}
