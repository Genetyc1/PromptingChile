import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/lib/auth-config"
import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function POST(request: NextRequest, { params }: { params: { dealId: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 })
    }

    const userRole = session.user.role as string
    if (!["admin", "owner"].includes(userRole)) {
      return NextResponse.json({ success: false, error: "Insufficient permissions" }, { status: 403 })
    }

    const body = await request.json()
    const { to, subject, content } = body

    if (!to || !subject || !content) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 })
    }

    // Crear el HTML del email con la firma de Prompting Chile
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: white;">
        <div style="background: #C28840; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Prompting Chile</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">AI Solutions</p>
        </div>
        <div style="padding: 30px 20px;">
          <div style="white-space: pre-wrap; line-height: 1.6; color: #333;">
${content}
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

    // Enviar el email usando Resend
    const { data, error } = await resend.emails.send({
      from: "Prompting Chile <contacto@promptingchile.cl>",
      to: [to],
      subject: subject,
      html: emailHtml,
    })

    if (error) {
      console.error("Error sending email:", error)
      return NextResponse.json({ success: false, error: "Error sending email" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      data,
    })
  } catch (error) {
    console.error("Error in send email API:", error)
    return NextResponse.json({ success: false, error: "Error sending email" }, { status: 500 })
  }
}
