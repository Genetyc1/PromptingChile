"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { sendNewsletterToAllSubscribers } from "@/app/actions/email"
import Header from "@/components/header"
import Footer from "@/components/footer"
import { AlertCircle, CheckCircle, Send } from "lucide-react"
import NewsletterStats from "./stats"

export default function AdminNewsletterPage() {
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    sentCount?: number
    totalCount?: number
  } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setResult(null)

    const formData = new FormData()
    formData.append("subject", subject)
    formData.append("content", content)

    try {
      const result = await sendNewsletterToAllSubscribers(formData)
      setResult(result)
    } catch (error) {
      setResult({
        success: false,
        message: "Error inesperado al enviar el newsletter",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Función para generar contenido de ejemplo con los artículos del blog
  const generateSampleContent = () => {
    const sampleContent = `
<p style="font-size: 16px; line-height: 1.6; color: #333;">
  Estimado suscriptor,
</p>

<p style="font-size: 16px; line-height: 1.6; color: #333;">
  Nos complace compartir contigo nuestros últimos artículos sobre IA y prompt engineering:
</p>

<div style="margin: 20px 0; border-left: 4px solid #C28840; padding-left: 15px;">
  <h3 style="margin: 0; color: #C28840;">IA Generativa: La Clave de la Transformación Digital para PYMEs en Latinoamérica</h3>
  <p style="margin-top: 5px; color: #555;">
    Análisis profundo sobre cómo las pequeñas y medianas empresas latinoamericanas están adoptando la inteligencia artificial generativa para competir globalmente.
  </p>
  <a href="https://promptingchile.cl/blog/ia-generativa-transformacion-digital-pymes-latinoamerica" style="color: #C28840; text-decoration: none; font-weight: bold;">Leer artículo →</a>
</div>

<div style="margin: 20px 0; border-left: 4px solid #C28840; padding-left: 15px;">
  <h3 style="margin: 0; color: #C28840;">The Future of Prompt Engineering in Enterprise Automation</h3>
  <p style="margin-top: 5px; color: #555;">
    How Fortune 500 companies are leveraging sophisticated prompt engineering to automate complex business processes and drive innovation.
  </p>
  <a href="https://promptingchile.cl/blog/future-prompt-engineering-enterprise-automation-2024" style="color: #C28840; text-decoration: none; font-weight: bold;">Leer artículo →</a>
</div>

<p style="font-size: 16px; line-height: 1.6; color: #333;">
  No te pierdas nuestros packs de prompts diseñados para emprendedores y empresas:
</p>

<div style="text-align: center; margin: 30px 0;">
  <a href="https://promptingchile.cl/shop" style="background-color: #C28840; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver Productos</a>
</div>

<p style="font-size: 16px; line-height: 1.6; color: #333;">
  ¡Gracias por ser parte de nuestra comunidad!
</p>

<p style="font-size: 16px; line-height: 1.6; color: #333;">
  El equipo de Prompting Chile
</p>
`
    setContent(sampleContent)
    setSubject("Nuevos artículos sobre IA y prompt engineering - Prompting Chile")
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
              Enviar Newsletter
            </h1>
            <p className="text-lg text-gray-300 max-w-2xl mx-auto">
              Envía un correo informativo a todos los suscriptores sobre las nuevas noticias del blog
            </p>
          </div>

          <NewsletterStats />

          {result && (
            <div
              className={`mb-8 p-4 rounded-lg flex items-start ${
                result.success ? "bg-green-900/20 border border-green-800" : "bg-red-900/20 border border-red-800"
              }`}
            >
              {result.success ? (
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3 flex-shrink-0" />
              )}
              <div>
                <p className={result.success ? "text-green-400" : "text-red-400"}>{result.message}</p>
                {result.success && result.sentCount !== undefined && (
                  <p className="text-gray-400 text-sm mt-1">
                    {result.sentCount} de {result.totalCount} correos enviados
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div>
              <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-lg border border-gray-800">
                <div className="mb-6">
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-400 mb-2">
                    Asunto del correo
                  </label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Ej: Nuevos artículos sobre IA - Prompting Chile"
                    required
                    className="bg-black border-gray-800 focus:border-[#C28840] text-white"
                  />
                </div>

                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-400">
                      Contenido HTML del correo
                    </label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSampleContent}
                      className="text-xs border-gray-700 hover:bg-gray-800"
                    >
                      Generar ejemplo
                    </Button>
                  </div>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="<p>Contenido HTML del correo...</p>"
                    required
                    rows={15}
                    className="bg-black border-gray-800 focus:border-[#C28840] text-white font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Puedes usar HTML para dar formato al contenido del correo.
                  </p>
                </div>

                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-400">
                    Este correo se enviará a todos los suscriptores del newsletter.
                  </p>
                  <Button type="submit" disabled={isLoading} className="bg-[#C28840] hover:bg-[#8B5A2B] text-white">
                    {isLoading ? (
                      "Enviando..."
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Enviar Newsletter
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </div>

            <div>
              <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 h-full">
                <h2 className="text-xl font-bold text-white mb-4">Vista previa</h2>
                <div className="bg-white rounded-lg p-4 overflow-auto max-h-[500px]">
                  {content ? (
                    <div dangerouslySetInnerHTML={{ __html: content }} className="text-black" />
                  ) : (
                    <div className="text-gray-400 text-center py-8">La vista previa del correo aparecerá aquí</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
