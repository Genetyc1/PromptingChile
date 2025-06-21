"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight, Check, Users, Target, Heart, Award } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-gray-400 text-lg mb-4"
            >
              About Us
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent"
            >
              Helping Businesses Grow
            </motion.h1>
          </div>

          {/* Main Content */}
          <div className="space-y-16">
            {/* Introduction */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <p className="text-xl text-gray-300 leading-relaxed max-w-3xl mx-auto">
                En Prompting Chile, empoderamos a emprendedores, freelancers y pequeñas empresas para que aprovechen el
                poder de la inteligencia artificial mediante el uso de prompts efectivos. Nuestro objetivo es claro:
                automatizar tareas, ahorrar tiempo y generar valor desde el primer uso.
              </p>
            </motion.section>

            {/* Who We Are */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
                Quiénes somos
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed mb-8">
                Prompting Chile es una iniciativa dedicada a democratizar el acceso a la inteligencia artificial. Con un
                enfoque profesional y una tecnología simple pero poderosa, ayudamos a las personas a aplicar IA en sus
                negocios sin complejidad técnica ni pérdida de tiempo.
              </p>

              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="text-[#C28840] mb-4">
                    <Target className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">100+ prompts listos para usar</h3>
                  <p className="text-gray-400">
                    Diseñados para planificación semanal, ventas, emails, automatización, contenido, liderazgo y más.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="text-[#C28840] mb-4">
                    <Users className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Plantillas adaptables</h3>
                  <p className="text-gray-400">
                    Aplicables a cualquier negocio, sin necesidad de conocimientos técnicos.
                  </p>
                </div>

                <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
                  <div className="text-[#C28840] mb-4">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Guía de uso y ejemplos reales</h3>
                  <p className="text-gray-400">Estructura fácil de usar para obtener resultados inmediatos.</p>
                </div>
              </div>
            </motion.section>

            {/* Our Values */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
                Nuestros valores
              </h2>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <Check className="h-6 w-6 text-[#C28840] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Innovación accesible</h3>
                    <p className="text-gray-300">
                      Creemos que la inteligencia artificial no es solo para expertos, sino una herramienta estratégica
                      al alcance de todos.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Check className="h-6 w-6 text-[#C28840] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Compromiso con la calidad</h3>
                    <p className="text-gray-300">
                      Nos esforzamos por ofrecer soluciones que realmente hagan una diferencia en la productividad y
                      eficiencia de nuestros usuarios.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <Check className="h-6 w-6 text-[#C28840] mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="text-xl font-semibold mb-2 text-white">Enfoque en el usuario</h3>
                    <p className="text-gray-300">
                      Diseñamos nuestros productos pensando en las necesidades reales de emprendedores y pequeñas
                      empresas.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>

            {/* Why Choose Us */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
                ¿Por qué elegirnos?
              </h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#C28840] to-[#8B5A2B] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Ahorro de tiempo</h3>
                  <p className="text-gray-300">
                    Nuestros prompts están diseñados para generar resultados reales en minutos.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#C28840] to-[#8B5A2B] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Facilidad de uso</h3>
                  <p className="text-gray-300">
                    No se requieren conocimientos técnicos para implementar nuestras soluciones.
                  </p>
                </div>

                <div className="text-center">
                  <div className="bg-gradient-to-r from-[#C28840] to-[#8B5A2B] rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">Soporte dedicado</h3>
                  <p className="text-gray-300">
                    Estamos comprometidos en ayudarte a aplicar IA en tu negocio de manera efectiva.
                  </p>
                </div>
              </div>
            </motion.section>

            {/* Our Team */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
                Nuestro equipo
              </h2>
              <p className="text-lg text-gray-300 leading-relaxed max-w-3xl mx-auto">
                Prompting Chile está compuesto por un equipo de profesionales apasionados por la inteligencia artificial
                y su aplicación práctica en el mundo empresarial. Nos dedicamos a crear herramientas que faciliten el
                acceso a la IA para todos.
              </p>
            </motion.section>

            {/* CTA Section */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center bg-gray-900 p-8 rounded-lg border border-gray-800"
            >
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white">
                ¿Listo para transformar tu negocio con IA?
              </h2>
              <p className="text-gray-300 mb-6">
                Descubre cómo nuestros prompts pueden ayudarte a automatizar tareas y generar más valor.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/shop">
                  <Button size="lg" className="bg-[#C28840] hover:bg-[#8B5A2B] text-white">
                    Ver Productos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-[#C28840] text-[#C28840] hover:bg-[#C28840] hover:text-white"
                  >
                    Contáctanos
                  </Button>
                </Link>
              </div>
            </motion.section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
