"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"

export default function TestContactPage() {
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testContactEmail = async () => {
    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: "Test",
          lastName: "User",
          email: "test@example.com",
          message: "Este es un mensaje de prueba para verificar que el sistema de correos funciona correctamente.",
        }),
      })

      const data = await response.json()
      setResult(data)
    } catch (error) {
      setResult({ success: false, error: error.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-[#C28840]">Test Contact Email</h1>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configuración Actual:</h2>
          <ul className="space-y-2 text-gray-300">
            <li>
              • <strong>RESEND_API_KEY:</strong> {process.env.RESEND_API_KEY ? "✅ Configurado" : "❌ No configurado"}
            </li>
            <li>
              • <strong>From:</strong> contacto@promptingchile.cl
            </li>
            <li>
              • <strong>To:</strong> contacto@promptingchile.cl + felipegonzalezlagos@hotmail.com
            </li>
          </ul>
        </div>

        <Button onClick={testContactEmail} disabled={loading} className="w-full bg-[#C28840] hover:bg-[#8B5A2B] mb-6">
          {loading ? "Enviando..." : "🧪 Probar Envío de Correo"}
        </Button>

        {result && (
          <div
            className={`p-6 rounded-lg border ${
              result.success
                ? "bg-green-900/20 border-green-800 text-green-400"
                : "bg-red-900/20 border-red-800 text-red-400"
            }`}
          >
            <h3 className="font-semibold mb-2">Resultado:</h3>
            <pre className="text-sm overflow-auto">{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
