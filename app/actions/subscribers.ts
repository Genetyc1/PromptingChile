"use server"

import { SubscriberService } from "../services/subscriber-service"
import { revalidatePath } from "next/cache"

// Obtener todos los suscriptores
export async function getAllSubscribers() {
  try {
    const subscribers = await SubscriberService.getAllSubscribers()
    return { success: true, data: subscribers }
  } catch (error) {
    console.error("Error al obtener suscriptores:", error)
    return { success: false, error: "Error al obtener los suscriptores" }
  }
}

// Obtener suscriptores activos
export async function getActiveSubscribers() {
  try {
    const subscribers = await SubscriberService.getActiveSubscribers()
    return { success: true, data: subscribers }
  } catch (error) {
    console.error("Error al obtener suscriptores activos:", error)
    return { success: false, error: "Error al obtener los suscriptores activos" }
  }
}

// Obtener un suscriptor por ID
export async function getSubscriberById(id: string) {
  try {
    const subscriber = await SubscriberService.getSubscriberById(id)
    if (!subscriber) {
      return { success: false, error: "Suscriptor no encontrado" }
    }
    return { success: true, data: subscriber }
  } catch (error) {
    console.error(`Error al obtener suscriptor ${id}:`, error)
    return { success: false, error: "Error al obtener el suscriptor" }
  }
}

// Crear un nuevo suscriptor
export async function createSubscriber(formData: FormData) {
  try {
    const email = formData.get("email") as string
    const name = (formData.get("name") as string) || undefined
    const source = (formData.get("source") as string) || undefined

    // Verificar si el email ya existe
    const existingSubscriber = await SubscriberService.getSubscriberByEmail(email)
    if (existingSubscriber) {
      return { success: false, error: "Este email ya está registrado" }
    }

    const newSubscriber = await SubscriberService.createSubscriber({
      email,
      name,
      createdAt: new Date(),
      status: "active",
      source,
    })

    revalidatePath("/admin/subscribers")

    return { success: true, data: newSubscriber }
  } catch (error) {
    console.error("Error al crear suscriptor:", error)
    return { success: false, error: "Error al crear el suscriptor" }
  }
}

// Actualizar un suscriptor existente
export async function updateSubscriber(id: string, formData: FormData) {
  try {
    const email = formData.get("email") as string
    const name = (formData.get("name") as string) || undefined
    const source = (formData.get("source") as string) || undefined
    const status = formData.get("status") as "active" | "unsubscribed"

    // Verificar si el email ya existe en otro suscriptor
    const existingSubscriber = await SubscriberService.getSubscriberByEmail(email)
    if (existingSubscriber && existingSubscriber.id !== id) {
      return { success: false, error: "Este email ya está registrado por otro suscriptor" }
    }

    const updatedSubscriber = await SubscriberService.updateSubscriber(id, {
      email,
      name,
      source,
      status,
    })

    if (!updatedSubscriber) {
      return { success: false, error: "Suscriptor no encontrado" }
    }

    revalidatePath("/admin/subscribers")

    return { success: true, data: updatedSubscriber }
  } catch (error) {
    console.error(`Error al actualizar suscriptor ${id}:`, error)
    return { success: false, error: "Error al actualizar el suscriptor" }
  }
}

// Eliminar un suscriptor
export async function deleteSubscriber(id: string) {
  try {
    const success = await SubscriberService.deleteSubscriber(id)

    if (!success) {
      return { success: false, error: "Suscriptor no encontrado" }
    }

    revalidatePath("/admin/subscribers")

    return { success: true }
  } catch (error) {
    console.error(`Error al eliminar suscriptor ${id}:`, error)
    return { success: false, error: "Error al eliminar el suscriptor" }
  }
}

// Cambiar el estado de un suscriptor
export async function changeSubscriberStatus(id: string, status: "active" | "unsubscribed") {
  try {
    const updatedSubscriber = await SubscriberService.changeSubscriberStatus(id, status)

    if (!updatedSubscriber) {
      return { success: false, error: "Suscriptor no encontrado" }
    }

    revalidatePath("/admin/subscribers")

    return { success: true, data: updatedSubscriber }
  } catch (error) {
    console.error(`Error al cambiar estado del suscriptor ${id}:`, error)
    return { success: false, error: "Error al cambiar el estado del suscriptor" }
  }
}

// Obtener estadísticas de suscriptores
export async function getSubscriberStats() {
  try {
    const stats = await SubscriberService.getSubscriberStats()
    return { success: true, data: stats }
  } catch (error) {
    console.error("Error al obtener estadísticas de suscriptores:", error)
    return { success: false, error: "Error al obtener las estadísticas" }
  }
}
