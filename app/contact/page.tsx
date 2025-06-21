"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail } from "lucide-react"
import { useState } from "react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterForm from "@/components/newsletter-form"
import { sendContactEmail } from "@/app/actions/contact"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState("")

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage("")

    try {
      console.log("📤 Enviando formulario de contacto:", formData)

      // Crear FormData para la Server Action
      const formDataToSend = new FormData()
      formDataToSend.append("firstName", formData.firstName)
      formDataToSend.append("lastName", formData.lastName)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("message", formData.message)

      // Llamar a la Server Action
      const result = await sendContactEmail(formDataToSend)

      if (result.success) {
        setSubmitMessage("✅ " + result.message)
        // Limpiar formulario
        setFormData({
          firstName: "",
          lastName: "",
          email: "",
          message: "",
        })
      } else {
        setSubmitMessage("❌ " + result.message)
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error)
      setSubmitMessage("❌ Hubo un error al enviar tu mensaje. Por favor intenta de nuevo.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
              Get in Touch with Us
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Have questions or need AI solutions? Let us know by filling out the form, and we&apos;ll be in touch!
            </p>
          </div>

          <div className="grid md:grid-cols-1 gap-8 mb-12">
            <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 flex items-center">
              <Mail className="h-6 w-6 text-[#C28840] mr-4" />
              <div>
                <h3 className="text-sm font-medium text-gray-400">E-mail</h3>
                <p className="text-white">contacto@promptingchile.cl</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-lg border border-gray-800 mb-12">
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-400 mb-2">
                  First Name *
                </label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Jane"
                  required
                  disabled={isSubmitting}
                  className="bg-black border-gray-800 focus:border-[#C28840] text-white"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-400 mb-2">
                  Last Name *
                </label>
                <Input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Smith"
                  required
                  disabled={isSubmitting}
                  className="bg-black border-gray-800 focus:border-[#C28840] text-white"
                />
              </div>
            </div>

            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-400 mb-2">
                Email *
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="jane@example.com"
                required
                disabled={isSubmitting}
                className="bg-black border-gray-800 focus:border-[#C28840] text-white"
              />
            </div>

            <div className="mb-6">
              <label htmlFor="message" className="block text-sm font-medium text-gray-400 mb-2">
                Message *
              </label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Hi, I am Jane and I want help with..."
                rows={5}
                required
                disabled={isSubmitting}
                className="bg-black border-gray-800 focus:border-[#C28840] text-white resize-none"
              />
            </div>

            {submitMessage && (
              <div
                className={`mb-6 p-4 rounded-lg ${
                  submitMessage.startsWith("✅")
                    ? "bg-green-900/20 border border-green-800 text-green-400"
                    : "bg-red-900/20 border border-red-800 text-red-400"
                }`}
              >
                {submitMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#C28840] hover:bg-[#8B5A2B] text-white py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sending...
                </>
              ) : (
                "Submit Form"
              )}
            </Button>
          </form>

          {/* Newsletter Section */}
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Stay Updated</h2>
            <p className="text-gray-300 mb-6">Subscribe to our newsletter for the latest AI insights and updates.</p>
            <NewsletterForm source="contact" className="max-w-md mx-auto" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
