import { NextResponse } from "next/server"
import { supabaseServer } from "@/app/lib/supabase"

export async function GET() {
  try {
    console.log("🔍 Iniciando diagnóstico de suscriptores...")

    // Verificar conexión a Supabase
    const { data: connectionTest, error: connectionError } = await supabaseServer
      .from("subscribers")
      .select("count", { count: "exact", head: true })

    if (connectionError) {
      console.error("❌ Error de conexión a Supabase:", connectionError)
      return NextResponse.json({
        status: "error",
        message: "Error de conexión a la base de datos",
        error: connectionError.message,
        suggestions: [
          "Verificar que la tabla 'subscribers' existe",
          "Verificar las credenciales de Supabase",
          "Ejecutar el script de creación de tablas",
        ],
      })
    }

    // Obtener todos los suscriptores
    const { data: subscribers, error: fetchError } = await supabaseServer
      .from("subscribers")
      .select("*")
      .order("created_at", { ascending: false })

    if (fetchError) {
      console.error("❌ Error al obtener suscriptores:", fetchError)
      return NextResponse.json({
        status: "error",
        message: "Error al obtener suscriptores",
        error: fetchError.message,
      })
    }

    // Calcular estadísticas
    const total = subscribers.length
    const active = subscribers.filter((s) => s.status === "active").length
    const unsubscribed = subscribers.filter((s) => s.status === "unsubscribed").length

    const thisMonth = new Date()
    const firstDayOfMonth = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1)
    const newThisMonth = subscribers.filter((s) => new Date(s.created_at) >= firstDayOfMonth).length

    const statistics = {
      total,
      active,
      unsubscribed,
      newThisMonth,
    }

    console.log("✅ Diagnóstico completado:", statistics)

    return NextResponse.json({
      status: "success",
      message: "Sistema de suscriptores funcionando correctamente",
      statistics,
      subscribers: subscribers.slice(0, 5), // Solo los primeros 5 para el debug
      database: {
        connected: true,
        table: "subscribers",
        totalRecords: total,
      },
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("❌ Error en diagnóstico de suscriptores:", error)
    return NextResponse.json({
      status: "error",
      message: "Error interno del servidor",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}

export async function POST() {
  try {
    console.log("🧪 Ejecutando test de creación de suscriptor...")

    // Crear un suscriptor de prueba
    const testEmail = `test-${Date.now()}@example.com`
    const { data, error } = await supabaseServer
      .from("subscribers")
      .insert({
        email: testEmail,
        name: "Usuario de Prueba",
        status: "active",
        source: "test",
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("❌ Error al crear suscriptor de prueba:", error)
      return NextResponse.json({
        status: "error",
        message: "Error al crear suscriptor de prueba",
        error: error.message,
      })
    }

    console.log("✅ Suscriptor de prueba creado:", data)

    // Eliminar el suscriptor de prueba
    await supabaseServer.from("subscribers").delete().eq("id", data.id)

    return NextResponse.json({
      status: "success",
      message: "Test de creación exitoso",
      testData: data,
    })
  } catch (error) {
    console.error("❌ Error en test de suscriptores:", error)
    return NextResponse.json({
      status: "error",
      message: "Error en test de creación",
      error: error instanceof Error ? error.message : "Error desconocido",
    })
  }
}
