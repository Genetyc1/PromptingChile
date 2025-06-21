import { supabaseServer } from "@/app/lib/supabase"
import type { Deal, DealNote, DealStatusHistory, DealStatus, Activity, DealWithActivityStatus } from "@/app/types/crm"

export class CRMService {
  static async getDeals(filters?: {
    status?: DealStatus[]
    search?: string
    show_archived?: boolean
  }): Promise<DealWithActivityStatus[]> {
    try {
      let query = supabaseServer.from("deals").select("*").order("created_at", { ascending: false })

      if (filters?.status && filters.status.length > 0) {
        query = query.in("status", filters.status)
      }

      if (filters?.search) {
        query = query.or(
          `title.ilike.%${filters.search}%,organization.ilike.%${filters.search}%,contact_name.ilike.%${filters.search}%,contact_email.ilike.%${filters.search}%`,
        )
      }

      if (!filters?.show_archived) {
        query = query.eq("archived", false)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error fetching deals:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("CRM Service - getDeals error:", error)
      throw error
    }
  }

  static async getDealById(id: string): Promise<Deal | null> {
    try {
      const { data, error } = await supabaseServer.from("deals").select("*").eq("id", id).single()

      if (error) {
        console.error("Error fetching deal:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("CRM Service - getDealById error:", error)
      throw error
    }
  }

  static async createDeal(deal: Partial<Deal>): Promise<Deal> {
    try {
      console.log("🔥 CRMService.createDeal - Input:", JSON.stringify(deal, null, 2))

      const { data, error } = await supabaseServer.from("deals").insert([deal]).select().single()

      if (error) {
        console.error("❌ Supabase error creating deal:", error)
        throw error
      }

      console.log("✅ Deal created in database:", data?.id)
      return data
    } catch (error) {
      console.error("❌ CRM Service - createDeal error:", error)
      throw error
    }
  }

  static async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    try {
      const { data, error } = await supabaseServer.from("deals").update(updates).eq("id", id).select().single()

      if (error) {
        console.error("Error updating deal:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("CRM Service - updateDeal error:", error)
      throw error
    }
  }

  static async deleteDeal(id: string): Promise<void> {
    try {
      // Eliminar en orden: notas, actividades, historial, deal
      await supabaseServer.from("deal_notes").delete().eq("deal_id", id)
      await supabaseServer.from("deal_activities").delete().eq("deal_id", id)
      await supabaseServer.from("deal_status_history").delete().eq("deal_id", id)

      const { error } = await supabaseServer.from("deals").delete().eq("id", id)

      if (error) {
        console.error("Error deleting deal:", error)
        throw error
      }
    } catch (error) {
      console.error("CRM Service - deleteDeal error:", error)
      throw error
    }
  }

  // Métodos para actividades
  static async getDealActivities(dealId: string): Promise<Activity[]> {
    try {
      console.log("🔥 Getting activities for deal:", dealId)

      const { data, error } = await supabaseServer
        .from("deal_activities")
        .select("*")
        .eq("deal_id", dealId)
        .order("scheduled_date", { ascending: true })
        .order("scheduled_time", { ascending: true })

      if (error) {
        console.error("❌ Error fetching deal activities:", error)
        throw error
      }

      console.log("✅ Activities fetched:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("❌ CRM Service - getDealActivities error:", error)
      throw error
    }
  }

  static async createActivity(activity: Partial<Activity>): Promise<Activity> {
    try {
      console.log("🔥 CRMService.createActivity - Input:", JSON.stringify(activity, null, 2))

      const { data, error } = await supabaseServer.from("deal_activities").insert([activity]).select().single()

      if (error) {
        console.error("❌ Supabase error creating activity:", error)
        throw error
      }

      console.log("✅ Activity created in database:", data?.id)
      return data
    } catch (error) {
      console.error("❌ CRM Service - createActivity error:", error)
      throw error
    }
  }

  static async updateActivity(id: string, updates: Partial<Activity>): Promise<Activity> {
    try {
      const { data, error } = await supabaseServer
        .from("deal_activities")
        .update(updates)
        .eq("id", id)
        .select()
        .single()

      if (error) {
        console.error("Error updating activity:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("CRM Service - updateActivity error:", error)
      throw error
    }
  }

  static async completeActivity(id: string): Promise<Activity> {
    try {
      return await this.updateActivity(id, {
        status: "completed",
        completed_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("CRM Service - completeActivity error:", error)
      throw error
    }
  }

  static async getDealNotes(dealId: string): Promise<DealNote[]> {
    try {
      console.log("🔥 Getting notes for deal:", dealId)

      const { data, error } = await supabaseServer
        .from("deal_notes")
        .select("*")
        .eq("deal_id", dealId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("❌ Error fetching deal notes:", error)
        throw error
      }

      console.log("✅ Notes fetched:", data?.length || 0)
      return data || []
    } catch (error) {
      console.error("❌ CRM Service - getDealNotes error:", error)
      throw error
    }
  }

  static async addDealNote(dealId: string, content: string, authorId: string): Promise<DealNote> {
    try {
      console.log("🔥 CRMService.addDealNote - Input:", { dealId, content, authorId })

      const { data, error } = await supabaseServer
        .from("deal_notes")
        .insert([
          {
            deal_id: dealId,
            content,
            author_id: authorId,
          },
        ])
        .select()
        .single()

      if (error) {
        console.error("❌ Supabase error adding deal note:", error)
        throw error
      }

      console.log("✅ Note added to database:", data?.id)
      return data
    } catch (error) {
      console.error("❌ CRM Service - addDealNote error:", error)
      throw error
    }
  }

  static async getDealStatusHistory(dealId: string): Promise<DealStatusHistory[]> {
    try {
      const { data, error } = await supabaseServer
        .from("deal_status_history")
        .select("*")
        .eq("deal_id", dealId)
        .order("changed_at", { ascending: false })

      if (error) {
        console.error("Error fetching deal status history:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("CRM Service - getDealStatusHistory error:", error)
      throw error
    }
  }

  static async exportDealsToCSV(): Promise<string> {
    try {
      const deals = await this.getDeals({ show_archived: true })

      const headers = [
        "ID",
        "Título",
        "Organización",
        "Contacto",
        "Email",
        "Teléfono",
        "Estado",
        "Valor (CLP)",
        "Calidad Lead",
        "Margen (%)",
        "Tipo Propuesta",
        "Canal",
        "Fecha Vencimiento",
        "Fecha Entrega",
        "Creado",
        "Actualizado",
      ]

      const csvContent = [
        headers.join(","),
        ...deals.map((deal) =>
          [
            deal.id,
            `"${deal.title || ""}"`,
            `"${deal.organization || ""}"`,
            `"${deal.contact_name || ""}"`,
            `"${deal.contact_email || ""}"`,
            `"${deal.contact_phone || ""}"`,
            `"${deal.status}"`,
            deal.value || 0,
            deal.quality_lead || 0,
            deal.margin || 0,
            `"${deal.proposal_type || ""}"`,
            `"${deal.channel || ""}"`,
            deal.due_date || "",
            deal.delivery_date || "",
            deal.created_at,
            deal.updated_at,
          ].join(","),
        ),
      ].join("\n")

      return csvContent
    } catch (error) {
      console.error("CRM Service - exportDealsToCSV error:", error)
      throw error
    }
  }
}

// Exportación por defecto también para compatibilidad
export default CRMService
