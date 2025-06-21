"use client"

import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterForm from "@/components/newsletter-form"

export default function TestNewsletterPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
            Prueba de Newsletter
          </h1>
          <p className="text-xl text-gray-300 mb-8">
            Esta página es para probar que el formulario de newsletter funciona desde cualquier lugar del sitio.
          </p>

          <div className="bg-gray-900 p-8 rounded-lg border border-gray-800 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Suscríbete a nuestro Newsletter</h2>
            <p className="text-gray-300 mb-6">
              Recibe las últimas noticias sobre IA y prompt engineering directamente en tu email.
            </p>
            <NewsletterForm />
          </div>

          <div className="text-left bg-gray-900 p-6 rounded-lg border border-gray-800">
            <h3 className="text-lg font-bold text-white mb-4">Instrucciones de Prueba:</h3>
            <ol className="text-gray-300 space-y-2">
              <li>1. Suscríbete usando el formulario de arriba</li>
              <li>
                2. Ve a <code className="bg-gray-800 px-2 py-1 rounded">/admin/subscribers</code>
              </li>
              <li>3. Verifica que tu email aparece en la lista</li>
              <li>4. Prueba también desde el footer de cualquier página</li>
              <li>
                5. Prueba desde el blog en <code className="bg-gray-800 px-2 py-1 rounded">/blog</code>
              </li>
            </ol>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
