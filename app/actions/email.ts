"use server"

import { Resend } from "resend"
import { SubscriberService } from "../services/subscriber-service"

const resend = new Resend(process.env.RESEND_API_KEY)

// Server Action para enviar correo a todos los suscriptores
export async function sendNewsletterToAllSubscribers(formData: FormData) {
  const subject = formData.get("subject") as string
  const content = formData.get("content") as string

  console.log("📧 Iniciando envío de newsletter:", { subject })

  if (!subject || !content) {
    return {
      success: false,
      message: "El asunto y contenido son obligatorios",
      sentCount: 0,
      totalCount: 0,
    }
  }

  try {
    // Obtener todos los suscriptores activos
    console.log("📋 Obteniendo suscriptores activos...")
    const subscribers = await SubscriberService.getActiveSubscribers()
    console.log(`📊 Encontrados ${subscribers.length} suscriptores activos`)

    if (subscribers.length === 0) {
      return {
        success: false,
        message: "No hay suscriptores activos para enviar el newsletter",
        sentCount: 0,
        totalCount: 0,
      }
    }

    // Contador de correos enviados exitosamente
    let sentCount = 0
    const errors: string[] = []

    // Enviar correo a cada suscriptor usando Resend
    console.log("📤 Iniciando envío masivo...")
    for (const subscriber of subscribers) {
      try {
        console.log(`📧 Enviando a: ${subscriber.email}`)

        await resend.emails.send({
          from: "Prompting Chile Newsletter <contacto@promptingchile.cl>",
          to: [subscriber.email],
          subject: subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <!-- Header -->
              <div style="background-color: #000; padding: 20px; text-align: center;">
                <h1 style="color: #C28840; margin: 0; font-size: 28px;">Prompting Chile</h1>
                <p style="color: white; margin: 5px 0; font-size: 14px;">AI Solutions</p>
              </div>
              
              <!-- Content -->
              <div style="padding: 30px; background-color: #f9f9f9;">
                <h2 style="color: #333; margin-bottom: 20px;">${subject}</h2>
                
                <div style="background: white; padding: 25px; border-radius: 8px; margin-bottom: 25px;">
                  ${content}
                </div>
                
                <!-- CTA Section -->
                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://www.promptingchile.cl/blog" 
                     style="background-color: #C28840; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 6px; font-weight: bold;
                            display: inline-block; margin-right: 10px;">
                    📖 Ver Blog
                  </a>
                  <a href="https://www.promptingchile.cl/shop" 
                     style="background-color: #3B82F6; color: white; padding: 12px 24px; 
                            text-decoration: none; border-radius: 6px; font-weight: bold;
                            display: inline-block;">
                    🛒 Ver Productos
                  </a>
                </div>
                
                <!-- Additional Links -->
                <div style="text-align: center; margin: 20px 0;">
                  <a href="https://www.promptingchile.cl/contact" 
                     style="background-color: #10B981; color: white; padding: 10px 20px; 
                            text-decoration: none; border-radius: 6px; font-weight: bold;
                            display: inline-block; margin: 5px;">
                    💬 Solicitar Cotización
                  </a>
                  <a href="https://www.promptingchile.cl/about" 
                     style="background-color: #6B7280; color: white; padding: 10px 20px; 
                            text-decoration: none; border-radius: 6px; font-weight: bold;
                            display: inline-block; margin: 5px;">
                    ℹ️ Sobre Nosotros
                  </a>
                </div>
              </div>
              
              <!-- Footer -->
              <div style="background-color: #f0f0f0; padding: 20px; text-align: center; font-size: 12px; color: #666;">
                <p style="margin: 0 0 10px 0;">
                  <strong>Prompting Chile</strong> - AI Solutions para empresas
                </p>
                <p style="margin: 0 0 10px 0;">
                  📧 Email: contacto@promptingchile.cl | 🌐 Web: <a href="https://www.promptingchile.cl" style="color: #C28840;">www.promptingchile.cl</a>
                </p>
                <p style="margin: 0;">
                  Recibiste este correo porque estás suscrito al newsletter de Prompting Chile.
                  <br>
                  <a href="https://www.promptingchile.cl/unsubscribe?email=${encodeURIComponent(subscriber.email)}" 
                     style="color: #C28840; text-decoration: none;">
                    Cancelar suscripción
                  </a>
                </p>
              </div>
            </div>
          `,
        })

        sentCount++
        console.log(`✅ Enviado exitosamente a: ${subscriber.email}`)

        // Pequeña pausa para evitar rate limiting
        await new Promise((resolve) => setTimeout(resolve, 100))
      } catch (error) {
        console.error(`❌ Error al enviar correo a ${subscriber.email}:`, error)
        errors.push(`${subscriber.email}: ${error}`)
        // Continuamos con el siguiente suscriptor aunque falle uno
      }
    }

    // Enviar reporte de newsletter a Felipe
    try {
      console.log("📊 Enviando reporte de newsletter a Felipe...")
      await resend.emails.send({
        from: "Prompting Chile <contacto@promptingchile.cl>",
        to: ["felipegonzalezlagos@hotmail.com"],
        subject: `📊 Reporte Newsletter: "${subject}"`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #000; padding: 20px; text-align: center;">
              <h1 style="color: #C28840; margin: 0;">Prompting Chile</h1>
              <p style="color: white; margin: 5px 0;">Reporte de Newsletter</p>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <h2 style="color: #333;">Newsletter Enviado</h2>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #C28840; margin-top: 0;">📊 Estadísticas:</h3>
                <p><strong>Asunto:</strong> ${subject}</p>
                <p><strong>Enviados exitosamente:</strong> ${sentCount}</p>
                <p><strong>Total suscriptores:</strong> ${subscribers.length}</p>
                <p><strong>Tasa de éxito:</strong> ${((sentCount / subscribers.length) * 100).toFixed(1)}%</p>
                <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CL", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}</p>
              </div>
              
              <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
                <h3 style="color: #C28840; margin-top: 0;">📝 Contenido Enviado:</h3>
                <div style="border-left: 3px solid #C28840; padding-left: 15px;">
                  ${content}
                </div>
              </div>
              
              ${
                errors.length > 0
                  ? `
                <div style="background: #fff3cd; padding: 20px; border-radius: 8px; border-left: 3px solid #ffc107;">
                  <h3 style="color: #856404; margin-top: 0;">⚠️ Errores (${errors.length}):</h3>
                  <ul style="color: #856404;">
                    ${errors.map((error) => `<li>${error}</li>`).join("")}
                  </ul>
                </div>
              `
                  : ""
              }
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="https://www.promptingchile.cl/admin/newsletter" 
                   style="background-color: #C28840; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 6px; font-weight: bold;">
                  Ver Panel Newsletter
                </a>
              </div>
            </div>
          </div>
        `,
      })
      console.log("✅ Reporte enviado a Felipe")
    } catch (reportError) {
      console.error("❌ Error al enviar reporte a Felipe:", reportError)
    }

    console.log(`📊 Resumen de envío: ${sentCount}/${subscribers.length} exitosos`)

    if (errors.length > 0) {
      console.error("❌ Errores durante el envío:", errors)
    }

    return {
      success: sentCount > 0,
      message:
        sentCount === subscribers.length
          ? `Newsletter enviado exitosamente a ${sentCount} suscriptores`
          : `Newsletter enviado a ${sentCount} de ${subscribers.length} suscriptores. ${errors.length} errores.`,
      sentCount,
      totalCount: subscribers.length,
    }
  } catch (error) {
    console.error("❌ Error general al enviar newsletter:", error)
    return {
      success: false,
      message: "Ocurrió un error al enviar el newsletter",
      sentCount: 0,
      totalCount: 0,
    }
  }
}
