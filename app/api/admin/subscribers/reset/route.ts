import { NextResponse } from "next/server"
import { supabaseServer } from "@/app/lib/supabase"

export async function POST() {
  try {
    console.log("🔄 API: Reseteando datos de suscriptores...")

    // Eliminar todos los suscriptores existentes
    const { error: deleteError } = await supabaseServer
      .from("subscribers")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000") // Delete all

    if (deleteError) {
      console.error("❌ Error al eliminar suscriptores:", deleteError)
      return NextResponse.json({
        success: false,
        error: deleteError.message,
        message: "Error al limpiar los datos existentes",
      })
    }

    // Insertar datos de ejemplo
    const sampleSubscribers = [
      {
        email: "juan.perez@example.com",
        name: "Juan Pérez",
        status: "active",
        source: "blog",
        created_at: new Date("2023-12-15").toISOString(),
      },
      {
        email: "maria.rodriguez@example.com",
        name: "María Rodríguez",
        status: "active",
        source: "landing",
        created_at: new Date("2024-01-05").toISOString(),
      },
      {
        email: "carlos.gomez@example.com",
        name: null,
        status: "active",
        source: "shop",
        created_at: new Date("2024-01-20").toISOString(),
      },
      {
        email: "ana.martinez@example.com",
        name: "Ana Martínez",
        status: "unsubscribed",
        source: "blog",
        created_at: new Date("2023-11-10").toISOString(),
      },
      {
        email: "pedro.sanchez@example.com",
        name: null,
        status: "active",
        source: "contact",
        created_at: new Date("2024-02-03").toISOString(),
      },
    ]

    const { data, error: insertError } = await supabaseServer.from("subscribers").insert(sampleSubscribers).select()

    if (insertError) {
      console.error("❌ Error al insertar datos de ejemplo:", insertError)
      return NextResponse.json({
        success: false,
        error: insertError.message,
        message: "Error al insertar los datos de ejemplo",
      })
    }

    console.log(`✅ API: Datos reseteados con ${data.length} suscriptores de ejemplo`)

    return NextResponse.json({
      success: true,
      data: data,
      message: `Datos reseteados exitosamente con ${data.length} suscriptores de ejemplo`,
    })
  } catch (error) {
    console.error("❌ Error en POST /api/admin/subscribers/reset:", error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      message: "Error interno del servidor",
    })
  }
}
