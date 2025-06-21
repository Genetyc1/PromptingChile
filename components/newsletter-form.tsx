"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail } from "lucide-react"

interface NewsletterFormProps {
  source?: string
}

export default function NewsletterForm({ source = "general" }: NewsletterFormProps) {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      setMessage("Por favor ingresa tu email")
      setIsSuccess(false)
      return
    }

    setIsSubmitting(true)
    setMessage("")

    try {
      const response = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          source,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        setMessage("¡Gracias por suscribirte! Revisa tu email para confirmar.")
        setIsSuccess(true)
        setEmail("")
      } else {
        setMessage(data.error || "Error al suscribirse. Inténtalo de nuevo.")
        setIsSuccess(false)
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      setMessage("Error al suscribirse. Inténtalo de nuevo.")
      setIsSuccess(false)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-2">
        <div className="flex-1">
          <Input
            type="email"
            placeholder="tu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            className="w-full"
          />
        </div>
        <Button type="submit" disabled={isSubmitting} className="bg-[#C28840] hover:bg-[#8B5A2B] text-white px-6">
          {isSubmitting ? (
            "Enviando..."
          ) : (
            <>
              <Mail className="h-4 w-4 mr-2" />
              Suscribirse
            </>
          )}
        </Button>
      </form>

      {message && <p className={`mt-2 text-sm ${isSuccess ? "text-green-600" : "text-red-600"}`}>{message}</p>}
    </div>
  )
}
