"use server"

import { Resend } from "resend"
import { CRMService } from "../services/crm-service"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(formData: FormData) {
  const firstName = formData.get("firstName") as string
  const lastName = formData.get("lastName") as string
  const email = formData.get("email") as string
  const message = formData.get("message") as string

  console.log("📧 Procesando formulario de contacto:", { firstName, lastName, email })

  // Validaciones
  if (!firstName || !lastName || !email || !message) {
    return {
      success: false,
      message: "Todos los campos son obligatorios",
    }
  }

  if (!email.includes("@")) {
    return {
      success: false,
      message: "Por favor ingresa un email válido",
    }
  }

  try {
    // 1. Enviar correo de notificación al equipo (incluyendo Felipe)
    console.log("📤 Enviando correo de notificación al equipo...")
    await resend.emails.send({
      from: "Prompting Chile <contacto@promptingchile.cl>",
      to: ["contacto@promptingchile.cl", "felipegonzalezlagos@hotmail.com"],
      subject: `Nueva consulta de ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #000; padding: 20px; text-align: center;">
            <h1 style="color: #C28840; margin: 0;">Prompting Chile</h1>
            <p style="color: white; margin: 5px 0;">Nueva consulta recibida</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333; margin-bottom: 20px;">Detalles del contacto:</h2>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Nombre:</strong> ${firstName} ${lastName}</p>
              <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #C28840;">${email}</a></p>
              <p><strong>Fecha:</strong> ${new Date().toLocaleDateString("es-CL", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}</p>
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px;">
              <h3 style="color: #C28840; margin-top: 0;">Mensaje:</h3>
              <p style="line-height: 1.6; color: #333; white-space: pre-wrap;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #e8f4f8; border-radius: 8px;">
              <p style="margin: 0; font-size: 14px; color: #666;">
                ✅ Este lead ha sido agregado automáticamente al CRM con estado "Prospección General".<br>
                🔗 <a href="https://promptingchile.cl/admin/crm" style="color: #C28840;">Ver en CRM</a>
              </p>
            </div>
            
            <div style="margin-top: 20px; text-align: center;">
              <a href="mailto:${email}?subject=Re: Tu consulta en Prompting Chile&body=Hola ${firstName},%0D%0A%0D%0AGracias por contactarnos..." 
                 style="background-color: #C28840; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;
                        display: inline-block;">
                📧 Responder Directamente
              </a>
            </div>
          </div>
        </div>
      `,
      reply_to: email,
    })

    // 2. Enviar correo de confirmación al cliente
    console.log("📤 Enviando correo de confirmación al cliente...")
    await resend.emails.send({
      from: "Prompting Chile <contacto@promptingchile.cl>",
      to: [email],
      subject: "Hemos recibido tu consulta - Prompting Chile",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #000; padding: 20px; text-align: center;">
            <h1 style="color: #C28840; margin: 0;">Prompting Chile</h1>
            <p style="color: white; margin: 5px 0;">AI Solutions</p>
          </div>
          
          <div style="padding: 30px; background-color: #f9f9f9;">
            <h2 style="color: #333;">¡Hola ${firstName}!</h2>
            
            <p style="line-height: 1.6; color: #333;">
              Gracias por contactarnos. Hemos recibido tu consulta y nuestro equipo la revisará a la brevedad.
            </p>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #C28840; margin-top: 0;">Tu mensaje:</h3>
              <p style="line-height: 1.6; color: #666; font-style: italic; white-space: pre-wrap;">"${message}"</p>
            </div>
            
            <div style="background: #f0f8ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #3B82F6;">
              <h4 style="color: #3B82F6; margin-top: 0;">⏰ Tiempo de respuesta:</h4>
              <p style="margin: 0; color: #333;">
                Nos pondremos en contacto contigo dentro de las próximas <strong>24 horas hábiles</strong>.
              </p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://promptingchile.cl/blog" 
                 style="background-color: #C28840; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;
                        display: inline-block; margin-right: 10px;">
                📖 Ver Blog
              </a>
              <a href="https://promptingchile.cl/shop" 
                 style="background-color: #3B82F6; color: white; padding: 12px 24px; 
                        text-decoration: none; border-radius: 6px; font-weight: bold;
                        display: inline-block;">
                🛒 Ver Productos
              </a>
            </div>
            
            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              <p style="font-size: 14px; color: #666; margin: 0;">
                <strong>Prompting Chile</strong><br>
                AI Solutions para empresas<br>
                📧 Email: contacto@promptingchile.cl<br>
                🌐 Web: https://promptingchile.cl
              </p>
            </div>
          </div>
        </div>
      `,
    })

    // 3. Crear lead automáticamente en el CRM
    console.log("🎯 Creando lead en CRM...")
    try {
      await CRMService.createDeal({
        title: `Consulta: ${firstName} ${lastName}`,
        contact_name: `${firstName} ${lastName}`,
        contact_email: email,
        notes: message,
        status: "Prospección General",
        quality_lead: 3,
        value: 0,
        organization: "",
        channel: "Formulario Web",
        proposal_type: "Consulta",
      })
      console.log("✅ Lead creado exitosamente en CRM")
    } catch (crmError) {
      console.error("❌ Error al crear lead en CRM:", crmError)
      // No fallar el envío del email si falla la creación del lead
    }

    console.log("✅ Correos enviados exitosamente a contacto@promptingchile.cl y felipegonzalezlagos@hotmail.com")
    return {
      success: true,
      message: "¡Gracias por tu mensaje! Te contactaremos pronto.",
    }
  } catch (error) {
    console.error("❌ Error al enviar correos:", error)
    return {
      success: false,
      message: "Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.",
    }
  }
}
