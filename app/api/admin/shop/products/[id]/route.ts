import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { supabaseServer } from "@/app/lib/supabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !["owner", "admin"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, currency, status, category } = body

    const { data: product, error } = await supabaseServer
      .from("products")
      .update({
        name,
        description,
        price: Number.parseFloat(price),
        currency,
        status,
        category: category || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) {
      console.error("Error updating product:", error)
      return NextResponse.json({ success: false, error: "Error al actualizar producto" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      product,
      message: "Producto actualizado exitosamente",
    })
  } catch (error) {
    console.error("Error updating product:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !["owner", "admin"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { error } = await supabaseServer.from("products").delete().eq("id", params.id)

    if (error) {
      console.error("Error deleting product:", error)
      return NextResponse.json({ success: false, error: "Error al eliminar producto" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Producto eliminado exitosamente",
    })
  } catch (error) {
    console.error("Error deleting product:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
