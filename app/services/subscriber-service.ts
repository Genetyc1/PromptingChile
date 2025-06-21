import type { Subscriber } from "../types/subscriber"
import { supabaseServer } from "@/app/lib/supabase"

// Clave para localStorage
const STORAGE_KEY = "prompting_chile_subscribers"

// Cross-platform global storage que persiste los datos
const getGlobalStorage = () => {
  if (typeof globalThis !== "undefined") {
    return globalThis
  }
  if (typeof window !== "undefined") {
    return window
  }
  if (typeof global !== "undefined") {
    return global
  }
  throw new Error("Unable to locate global object")
}

const globalStorage = getGlobalStorage() as any

// Función para cargar datos desde localStorage
const loadFromStorage = (): Map<string, Subscriber> => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        const map = new Map()

        // Convertir las fechas de string a Date objects
        Object.entries(data).forEach(([key, value]: [string, any]) => {
          map.set(key, {
            ...value,
            createdAt: new Date(value.createdAt),
          })
        })

        console.log(`💾 Datos cargados desde localStorage: ${map.size} suscriptores`)
        return map
      }
    } catch (error) {
      console.error("❌ Error al cargar desde localStorage:", error)
    }
  }

  // Si no hay localStorage o hay error, crear datos iniciales
  return createInitialData()
}

// Función para guardar datos en localStorage
const saveToStorage = (subscribersMap: Map<string, Subscriber>) => {
  if (typeof window !== "undefined" && window.localStorage) {
    try {
      const data: Record<string, any> = {}
      subscribersMap.forEach((value, key) => {
        data[key] = {
          ...value,
          createdAt: value.createdAt.toISOString(),
        }
      })

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log(`💾 Datos guardados en localStorage: ${subscribersMap.size} suscriptores`)
    } catch (error) {
      console.error("❌ Error al guardar en localStorage:", error)
    }
  }
}

// Función para crear datos iniciales
const createInitialData = (): Map<string, Subscriber> => {
  const map = new Map()

  const sampleSubscribers: Subscriber[] = [
    {
      id: "1",
      email: "juan.perez@example.com",
      name: "Juan Pérez",
      createdAt: new Date("2023-12-15"),
      status: "active",
      source: "blog",
    },
    {
      id: "2",
      email: "maria.rodriguez@example.com",
      name: "María Rodríguez",
      createdAt: new Date("2024-01-05"),
      status: "active",
      source: "landing",
    },
    {
      id: "3",
      email: "carlos.gomez@example.com",
      createdAt: new Date("2024-01-20"),
      status: "active",
      source: "shop",
    },
    {
      id: "4",
      email: "ana.martinez@example.com",
      name: "Ana Martínez",
      createdAt: new Date("2023-11-10"),
      status: "unsubscribed",
      source: "blog",
    },
    {
      id: "5",
      email: "pedro.sanchez@example.com",
      createdAt: new Date("2024-02-03"),
      status: "active",
      source: "contact",
    },
  ]

  sampleSubscribers.forEach((sub) => {
    map.set(sub.id, sub)
  })

  console.log(`🚀 Datos iniciales creados: ${sampleSubscribers.length} suscriptores`)
  return map
}

// Inicializar la base de datos con persistencia
if (!globalStorage.subscribersDB) {
  globalStorage.subscribersDB = loadFromStorage()
}

// En una aplicación real, estas funciones se conectarían a una base de datos
export const SubscriberService = {
  // Obtener todos los suscriptores
  getAllSubscribers: async (): Promise<Subscriber[]> => {
    try {
      console.log("📋 Obteniendo todos los suscriptores desde Supabase...")

      const { data, error } = await supabaseServer
        .from("subscribers")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error al obtener suscriptores:", error)
        throw error
      }

      const subscribers = data.map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name || undefined,
        createdAt: new Date(row.created_at),
        status: row.status as "active" | "unsubscribed",
        source: row.source || undefined,
      }))

      console.log(`✅ Obtenidos ${subscribers.length} suscriptores desde Supabase`)
      return subscribers
    } catch (error) {
      console.error("❌ Error en getAllSubscribers:", error)
      return []
    }
  },

  // Obtener suscriptores activos
  getActiveSubscribers: async (): Promise<Subscriber[]> => {
    try {
      console.log("✅ Obteniendo suscriptores activos desde Supabase...")

      const { data, error } = await supabaseServer
        .from("subscribers")
        .select("*")
        .eq("status", "active")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error al obtener suscriptores activos:", error)
        throw error
      }

      const subscribers = data.map((row) => ({
        id: row.id,
        email: row.email,
        name: row.name || undefined,
        createdAt: new Date(row.created_at),
        status: row.status as "active" | "unsubscribed",
        source: row.source || undefined,
      }))

      console.log(`✅ Obtenidos ${subscribers.length} suscriptores activos desde Supabase`)
      return subscribers
    } catch (error) {
      console.error("❌ Error en getActiveSubscribers:", error)
      return []
    }
  },

  // Obtener un suscriptor por ID
  getSubscriberById: async (id: string): Promise<Subscriber | null> => {
    try {
      console.log(`🔍 Buscando suscriptor por ID: ${id}`)

      const { data, error } = await supabaseServer.from("subscribers").select("*").eq("id", id).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log(`❌ Suscriptor no encontrado: ${id}`)
          return null
        }
        console.error("❌ Error al buscar suscriptor:", error)
        throw error
      }

      const subscriber = {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        createdAt: new Date(data.created_at),
        status: data.status as "active" | "unsubscribed",
        source: data.source || undefined,
      }

      console.log(`✅ Suscriptor encontrado: ${subscriber.email}`)
      return subscriber
    } catch (error) {
      console.error(`❌ Error en getSubscriberById(${id}):`, error)
      return null
    }
  },

  // Obtener un suscriptor por email
  getSubscriberByEmail: async (email: string): Promise<Subscriber | null> => {
    try {
      console.log(`📧 Buscando suscriptor por email: ${email}`)

      const { data, error } = await supabaseServer.from("subscribers").select("*").eq("email", email).single()

      if (error) {
        if (error.code === "PGRST116") {
          console.log(`📧 No se encontró suscriptor con email: ${email}`)
          return null
        }
        console.error("❌ Error al buscar suscriptor por email:", error)
        throw error
      }

      const subscriber = {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        createdAt: new Date(data.created_at),
        status: data.status as "active" | "unsubscribed",
        source: data.source || undefined,
      }

      console.log(`✅ Suscriptor encontrado por email: ${subscriber.email}`)
      return subscriber
    } catch (error) {
      console.error(`❌ Error en getSubscriberByEmail(${email}):`, error)
      return null
    }
  },

  // Crear un nuevo suscriptor
  createSubscriber: async (subscriber: Omit<Subscriber, "id">): Promise<Subscriber> => {
    try {
      console.log(`✅ Creando nuevo suscriptor: ${subscriber.email}`)

      const { data, error } = await supabaseServer
        .from("subscribers")
        .insert({
          email: subscriber.email,
          name: subscriber.name || null,
          status: subscriber.status,
          source: subscriber.source || null,
          created_at: subscriber.createdAt.toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error("❌ Error al crear suscriptor:", error)
        throw error
      }

      const newSubscriber = {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        createdAt: new Date(data.created_at),
        status: data.status as "active" | "unsubscribed",
        source: data.source || undefined,
      }

      console.log(`✅ Suscriptor creado exitosamente: ${newSubscriber.email} (ID: ${newSubscriber.id})`)
      return newSubscriber
    } catch (error) {
      console.error(`❌ Error en createSubscriber(${subscriber.email}):`, error)
      throw error
    }
  },

  // Actualizar un suscriptor existente
  updateSubscriber: async (id: string, updates: Partial<Subscriber>): Promise<Subscriber | null> => {
    try {
      console.log(`🔄 Actualizando suscriptor: ${id}`)

      const updateData: any = {}
      if (updates.email) updateData.email = updates.email
      if (updates.name !== undefined) updateData.name = updates.name || null
      if (updates.status) updateData.status = updates.status
      if (updates.source !== undefined) updateData.source = updates.source || null

      const { data, error } = await supabaseServer.from("subscribers").update(updateData).eq("id", id).select().single()

      if (error) {
        console.error("❌ Error al actualizar suscriptor:", error)
        throw error
      }

      const updatedSubscriber = {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        createdAt: new Date(data.created_at),
        status: data.status as "active" | "unsubscribed",
        source: data.source || undefined,
      }

      console.log(`✅ Suscriptor actualizado: ${updatedSubscriber.email}`)
      return updatedSubscriber
    } catch (error) {
      console.error(`❌ Error en updateSubscriber(${id}):`, error)
      return null
    }
  },

  // Eliminar un suscriptor
  deleteSubscriber: async (id: string): Promise<boolean> => {
    try {
      console.log(`🗑️ Eliminando suscriptor: ${id}`)

      const { error } = await supabaseServer.from("subscribers").delete().eq("id", id)

      if (error) {
        console.error("❌ Error al eliminar suscriptor:", error)
        throw error
      }

      console.log(`✅ Suscriptor eliminado exitosamente: ${id}`)
      return true
    } catch (error) {
      console.error(`❌ Error en deleteSubscriber(${id}):`, error)
      return false
    }
  },

  // Cambiar el estado de un suscriptor
  changeSubscriberStatus: async (id: string, status: "active" | "unsubscribed"): Promise<Subscriber | null> => {
    try {
      console.log(`🔄 Cambiando estado del suscriptor ${id} a: ${status}`)

      const { data, error } = await supabaseServer.from("subscribers").update({ status }).eq("id", id).select().single()

      if (error) {
        console.error("❌ Error al cambiar estado del suscriptor:", error)
        throw error
      }

      const updatedSubscriber = {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        createdAt: new Date(data.created_at),
        status: data.status as "active" | "unsubscribed",
        source: data.source || undefined,
      }

      console.log(`✅ Estado cambiado para ${updatedSubscriber.email}: ${status}`)
      return updatedSubscriber
    } catch (error) {
      console.error(`❌ Error en changeSubscriberStatus(${id}, ${status}):`, error)
      return null
    }
  },

  // Obtener estadísticas de suscriptores
  getSubscriberStats: async () => {
    try {
      console.log("📊 Calculando estadísticas de suscriptores...")

      // Obtener todos los suscriptores
      const { data: allData, error: allError } = await supabaseServer.from("subscribers").select("status, created_at")

      if (allError) {
        console.error("❌ Error al obtener estadísticas:", allError)
        throw allError
      }

      const total = allData.length
      const active = allData.filter((s) => s.status === "active").length
      const unsubscribed = allData.filter((s) => s.status === "unsubscribed").length

      // Calcular nuevos suscriptores este mes
      const thisMonth = new Date()
      const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
      const newThisMonth = allData.filter((s) => new Date(s.created_at) >= firstDayOfMonth).length

      const stats = {
        total,
        active,
        unsubscribed,
        newThisMonth,
      }

      console.log("📊 Estadísticas calculadas:", stats)
      return stats
    } catch (error) {
      console.error("❌ Error en getSubscriberStats:", error)
      return {
        total: 0,
        active: 0,
        unsubscribed: 0,
        newThisMonth: 0,
      }
    }
  },

  // Función para limpiar todos los datos (útil para testing)
  clearAllData: async (): Promise<void> => {
    try {
      console.log("🧹 Limpiando todos los suscriptores...")

      const { error } = await supabaseServer
        .from("subscribers")
        .delete()
        .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all

      if (error) {
        console.error("❌ Error al limpiar datos:", error)
        throw error
      }

      console.log("✅ Todos los suscriptores han sido eliminados")
    } catch (error) {
      console.error("❌ Error en clearAllData:", error)
    }
  },

  // Función para resetear a datos iniciales
  resetToInitialData: async (): Promise<void> => {
    try {
      console.log("🔄 Reseteando a datos iniciales...")

      // Primero limpiar datos existentes
      await SubscriberService.clearAllData()

      // Insertar datos de ejemplo
      const sampleSubscribers = [
        {
          email: "juan.perez@example.com",
          name: "Juan Pérez",
          status: "active" as const,
          source: "blog",
          createdAt: new Date("2023-12-15"),
        },
        {
          email: "maria.rodriguez@example.com",
          name: "María Rodríguez",
          status: "active" as const,
          source: "landing",
          createdAt: new Date("2024-01-05"),
        },
        {
          email: "carlos.gomez@example.com",
          name: undefined,
          status: "active" as const,
          source: "shop",
          createdAt: new Date("2024-01-20"),
        },
        {
          email: "ana.martinez@example.com",
          name: "Ana Martínez",
          status: "unsubscribed" as const,
          source: "blog",
          createdAt: new Date("2023-11-10"),
        },
        {
          email: "pedro.sanchez@example.com",
          name: undefined,
          status: "active" as const,
          source: "contact",
          createdAt: new Date("2024-02-03"),
        },
      ]

      for (const subscriber of sampleSubscribers) {
        await SubscriberService.createSubscriber(subscriber)
      }

      console.log(`✅ Datos iniciales creados: ${sampleSubscribers.length} suscriptores`)
    } catch (error) {
      console.error("❌ Error en resetToInitialData:", error)
    }
  },
}
