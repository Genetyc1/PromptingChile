"use server"

import { SubscriberService } from "../services/subscriber-service"
import { revalidatePath } from "next/cache"

export async function subscribeToNewsletter(formData: FormData) {
  const email = formData.get("email") as string

  console.log(`🔄 Procesando suscripción para: ${email}`)

  // Validación básica
  if (!email || !email.includes("@")) {
    console.log(`❌ Email inválido: ${email}`)
    return {
      success: false,
      message: "Por favor ingresa un email válido",
    }
  }

  try {
    // Verificar si el email ya existe
    const existingSubscriber = await SubscriberService.getSubscriberByEmail(email)

    if (existingSubscriber) {
      console.log(`👤 Suscriptor existente encontrado: ${email}, estado: ${existingSubscriber.status}`)

      if (existingSubscriber.status === "active") {
        return {
          success: false,
          message: "Este email ya está suscrito a nuestro newsletter.",
        }
      } else {
        // Reactivar suscriptor que se había desuscrito
        await SubscriberService.changeSubscriberStatus(existingSubscriber.id, "active")

        // Revalidar las páginas del admin para mostrar los cambios
        revalidatePath("/admin/subscribers")
        revalidatePath("/admin/newsletter")
        revalidatePath("/admin")

        console.log(`✅ Suscriptor reactivado: ${email}`)

        return {
          success: true,
          message: "¡Bienvenido de vuelta! Tu suscripción ha sido reactivada.",
        }
      }
    }

    // Crear nuevo suscriptor
    const newSubscriber = await SubscriberService.createSubscriber({
      email,
      createdAt: new Date(),
      status: "active",
      source: "newsletter", // Identificar que viene del formulario de newsletter
    })

    console.log(`✅ Nuevo suscriptor creado: ${newSubscriber.email} con ID: ${newSubscriber.id}`)

    // Revalidar las páginas del admin para mostrar los cambios
    revalidatePath("/admin/subscribers")
    revalidatePath("/admin/newsletter")
    revalidatePath("/admin")

    console.log(`🔄 Páginas revalidadas`)

    return {
      success: true,
      message: "¡Gracias por suscribirte! Te enviaremos las últimas noticias de IA.",
    }
  } catch (error) {
    console.error("❌ Error al procesar suscripción:", error)
    return {
      success: false,
      message: "Hubo un error al procesar tu suscripción. Inténtalo de nuevo.",
    }
  }
}
