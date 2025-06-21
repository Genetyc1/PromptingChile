import { NextResponse } from "next/server"
import { supabaseServer } from "@/app/lib/supabase"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`🔄 API: Actualizando suscriptor ${params.id}...`)

    const body = await request.json()
    const { status, name, email, source } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (name !== undefined) updateData.name = name || null
    if (email) updateData.email = email
    if (source !== undefined) updateData.source = source || null

    const { data, error } = await supabaseServer
      .from("subscribers")
      .update(updateData)
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("❌ Error al actualizar suscriptor:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        message: "Error al actualizar el suscriptor",
      })
    }

    console.log(`✅ API: Suscriptor actualizado: ${data.email}`)

    return NextResponse.json({
      success: true,
      data: {
        id: data.id,
        email: data.email,
        name: data.name || undefined,
        createdAt: new Date(data.created_at),
        status: data.status,
        source: data.source || undefined,
      },
      message: "Suscriptor actualizado exitosamente",
    })
  } catch (error) {
    console.error(`❌ Error en PATCH /api/admin/subscribers/${params.id}:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      message: "Error interno del servidor",
    })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log(`🗑️ API: Eliminando suscriptor ${params.id}...`)

    const { error } = await supabaseServer.from("subscribers").delete().eq("id", params.id)

    if (error) {
      console.error("❌ Error al eliminar suscriptor:", error)
      return NextResponse.json({
        success: false,
        error: error.message,
        message: "Error al eliminar el suscriptor",
      })
    }

    console.log(`✅ API: Suscriptor eliminado: ${params.id}`)

    return NextResponse.json({
      success: true,
      message: "Suscriptor eliminado exitosamente",
    })
  } catch (error) {
    console.error(`❌ Error en DELETE /api/admin/subscribers/${params.id}:`, error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
      message: "Error interno del servidor",
    })
  }
}
