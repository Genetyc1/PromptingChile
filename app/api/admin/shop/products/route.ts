import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { supabaseServer } from "@/app/lib/supabase"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !["owner", "admin"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { data: products, error } = await supabaseServer
      .from("products")
      .select("*")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching products:", error)
      return NextResponse.json({ success: false, error: "Error al obtener productos" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      products: products || [],
    })
  } catch (error) {
    console.error("Error in products API:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || !["owner", "admin"].includes(session.user.role as string)) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, price, currency = "USD", status = "active", category } = body

    if (!name || !description || !price) {
      return NextResponse.json({ error: "Nombre, descripción y precio son requeridos" }, { status: 400 })
    }

    const { data: product, error } = await supabaseServer
      .from("products")
      .insert({
        name,
        description,
        price: Number.parseFloat(price),
        currency,
        status,
        category: category || null,
        sales_count: 0,
        created_by: session.user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating product:", error)
      return NextResponse.json({ success: false, error: "Error al crear producto" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      product,
      message: "Producto creado exitosamente",
    })
  } catch (error) {
    console.error("Error creating product:", error)
    return NextResponse.json({ success: false, error: "Error interno del servidor" }, { status: 500 })
  }
}
