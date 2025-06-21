"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterForm from "@/components/newsletter-form"

export default function ShopPage() {
  const services = [
    {
      id: 1,
      title: "El Pack Definitivo de Prompts para Emprender con ChatGPT",
      shortTitle: "El Pack Definitivo de Prompts para Emprender con ChatGPT",
      image: "/spanish-pack-official.png",
      features: ["Vender más", "Automatizar tareas", "Organizar tu semana"],
      price: "$19,99",
      language: "es",
      url: "https://promptingchile.gumroad.com/l/jmkpzq?layout=profile",
      hotItem: true,
    },
    {
      id: 2,
      title: "The Ultimate ChatGPT Prompt Pack for Entrepreneurs",
      shortTitle: "The Ultimate ChatGPT Prompt Pack for Entrepreneurs",
      image: "/english-pack-official.png",
      features: ["Sell more", "Automate tasks", "Organize your week"],
      price: "$19,99",
      language: "en",
      url: "https://promptingchile.gumroad.com/l/mkioj?layout=profile",
      hotItem: true,
    },
  ]

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
              Automatiza tu Trabajo </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Descubre nuestros packs de prompts para potenciar tu negocio con ChatGPT
              <br />
              <span className="text-[#C28840]">|</span>
              <br />
              Discover our prompt packs to boost your business with ChatGPT
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {services.map((service) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="bg-black border border-gray-800 rounded-lg overflow-hidden hover:border-[#C28840] transition-colors"
              >
                <Link href={service.url} target="_blank" rel="noopener noreferrer">
                  <div className="relative">
                    {service.hotItem && (
                      <div className="absolute top-0 left-0 bg-[#C28840] text-black font-bold py-1 px-4 rotate-[-45deg] translate-x-[-30%] translate-y-[50%] z-10">
                        HOT ITEM
                      </div>
                    )}
                    <div className="bg-white p-0 text-black">
                      <img
                        src={service.image || "/placeholder.svg"}
                        alt={service.title}
                        className="w-full h-auto object-cover"
                      />
                    </div>
                    <div className="p-4 bg-[#0A1A2F] text-white">
                      <h3 className="text-lg font-bold">{service.shortTitle}</h3>
                    </div>
                    <div className="bg-[#0A1A2F] px-4 pb-4 flex justify-start">
                      <div className="bg-[#C28840] text-black font-bold py-1 px-3 rounded-sm flex items-center">
                        {service.price}
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <p className="text-xl text-gray-300 mb-8">
              {`¿Necesitas un pack personalizado para tu negocio? Contáctanos`}
              <br />
              <span className="text-[#C28840]">|</span>
              <br />
              {`Need a custom pack for your business? Contact us`}
            </p>
            <Link href="/contact">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-[#C28840] hover:bg-[#8B5A2B] text-white px-8 py-3 rounded-lg inline-flex items-center"
              >
                Contact Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </motion.button>
            </Link>
          </div>

          {/* Newsletter Section */}
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Mantente Informado</h2>
            <p className="text-gray-300 mb-6">Suscríbete para recibir las últimas novedades sobre IA y prompts</p>
            <NewsletterForm source="shop" />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
