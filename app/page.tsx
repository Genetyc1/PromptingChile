"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowRight, Check, Star, Zap, Shield, Rocket, Users, Code, Palette, Globe } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterForm from "@/components/newsletter-form"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative px-6 overflow-hidden">
        {/* Animated Background - Destellos difuminados */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-[#C28840]/15 to-[#8B5A2B]/15 blur-3xl"
            animate={{
              x: [0, 100, -50, 0],
              y: [0, -100, 50, 0],
              scale: [1, 1.2, 0.8, 1],
            }}
            transition={{
              duration: 20,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ top: "10%", left: "10%" }}
          />
          <motion.div
            className="absolute w-80 h-80 rounded-full bg-gradient-to-r from-[#D4A574]/10 to-[#C28840]/10 blur-2xl"
            animate={{
              x: [0, -80, 60, 0],
              y: [0, 80, -40, 0],
              scale: [1, 0.9, 1.1, 1],
            }}
            transition={{
              duration: 25,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ top: "60%", right: "15%" }}
          />
          <motion.div
            className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-[#E6C7A3]/8 to-[#C28840]/8 blur-xl"
            animate={{
              x: [0, 60, -30, 0],
              y: [0, -60, 30, 0],
              scale: [1, 1.1, 0.9, 1],
            }}
            transition={{
              duration: 18,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            style={{ bottom: "20%", left: "20%" }}
          />

          {/* Floating particles - Destellos pequeños */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-[#C28840]/30 rounded-full"
                animate={{
                  x: [0, Math.random() * 200 - 100],
                  y: [0, Math.random() * 200 - 100],
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: Math.random() * 10 + 10,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: Math.random() * 5,
                  ease: "easeInOut",
                }}
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                }}
              />
            ))}
          </div>
        </div>

        <div className="text-center max-w-4xl mx-auto relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
            <Badge className="mb-4 bg-[#8B5A2B] text-[#E6C7A3] border-[#C28840]">
              ✨ Democratizando la IA con Prompts
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
              Prompting Chile
              <br />
              AI Solutions
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Una iniciativa que democratiza el acceso a la inteligencia artificial a través del poder de los prompts.
              Diseñado especialmente para emprendedores, freelancers y pequeñas empresas.
            </p>
          </motion.div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link href="/contact">
              <Button size="lg" className="bg-[#C28840] hover:bg-[#8B5A2B] text-white">
                Use For Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-[#C28840] text-[#C28840] hover:bg-[#C28840] hover:text-white"
            >
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <NewsletterForm />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
              Características Poderosas
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Todo lo que necesitas para automatizar, ahorrar tiempo y crear valor desde el primer uso
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Lightning Fast",
                description: "Optimized for speed and performance with cutting-edge technology",
              },
              {
                icon: <Code className="h-8 w-8" />,
                title: "Clean Code",
                description: "Well-structured, maintainable code that follows best practices",
              },
              {
                icon: <Palette className="h-8 w-8" />,
                title: "Customizable",
                description: "Fully customizable design system with unlimited possibilities",
              },
              {
                icon: <Shield className="h-8 w-8" />,
                title: "Secure",
                description: "Built with security in mind, protecting your data and users",
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Responsive",
                description: "Perfect on all devices, from mobile to desktop",
              },
              {
                icon: <Rocket className="h-8 w-8" />,
                title: "Easy Deploy",
                description: "One-click deployment to popular hosting platforms",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-black border-gray-900 hover:border-[#C28840] transition-colors">
                  <CardHeader>
                    <div className="text-[#C28840] mb-2">{feature.icon}</div>
                    <CardTitle className="text-white">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-gray-300">{feature.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
                ¿Por qué elegir Prompting Chile?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Con una imagen profesional, un enfoque tecnológico simple pero poderoso, y un fuerte compromiso con la
                calidad, ayudamos a las personas a aplicar IA en sus negocios—sin complejidad técnica ni tiempo perdido.
              </p>
              <div className="space-y-4">
                {[
                  "AI-powered design suggestions",
                  "Automatic code optimization",
                  "Smart responsive layouts",
                  "Built-in SEO optimization",
                  "Advanced analytics integration",
                ].map((item, index) => (
                  <div key={index} className="flex items-center">
                    <Check className="h-5 w-5 text-[#C28840] mr-3" />
                    <span className="text-gray-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-r from-[#C28840] to-[#8B5A2B] rounded-lg p-8 text-center">
                <Users className="h-16 w-16 mx-auto mb-4 text-white" />
                <h3 className="text-2xl font-bold text-white mb-2">10,000+</h3>
                <p className="text-[#E6C7A3] mb-6">Happy Developers</p>
                <Link href="/about">
                  <Button className="bg-white text-[#C28840] hover:bg-gray-100 font-semibold">
                    Learn More About Us
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
              What Developers Say
            </h2>
            <p className="text-xl text-gray-300">Trusted by thousands of developers worldwide</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Frontend Developer",
                content: "This AI template saved me weeks of development time. The code quality is exceptional!",
                rating: 5,
              },
              {
                name: "Mike Chen",
                role: "Full Stack Developer",
                content: "Amazing template with great documentation. The AI features are game-changing.",
                rating: 5,
              },
              {
                name: "Emily Rodriguez",
                role: "UI/UX Designer",
                content: "Beautiful design system and incredibly easy to customize. Highly recommended!",
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="bg-black border-gray-900">
                  <CardHeader>
                    <div className="flex items-center mb-2">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="h-4 w-4 text-[#C28840] fill-current" />
                      ))}
                    </div>
                    <CardTitle className="text-white">{testimonial.name}</CardTitle>
                    <CardDescription className="text-[#C28840]">{testimonial.role}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300">"{testimonial.content}"</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-6 bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
              Simple Pricing
            </h2>
            <p className="text-xl text-gray-300">Choose the plan that works best for you</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Free",
                price: "$0 USD",
                description: "Solicita tu versión de prueba sin compromiso",
                features: [
                  "Plantillas básicas",
                  "Soporte comunitario",
                  "Componentes estándar",
                  "Personalización limitada",
                ],
                popular: false,
              },
              {
                name: "Pro",
                price: "Desde $99 USD",
                description: "Soluciones personalizadas para tus procesos",
                features: [
                  "Nos adaptamos a tus necesidades",
                  "Soporte prioritario",
                  "Componentes avanzados",
                  "Personalización total",
                  "Funcionalidades potenciadas por IA",
                ],
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Desde $149 USD",
                description: "IA de alto impacto para grandes organizaciones",
                features: [
                  "Todo lo incluido en Pro",
                  "Plantillas y flujos 100% personalizados",
                  "Soporte dedicado con acuerdos de nivel de servicio",
                  "Colaboración en equipo",
                  "Opciones de marca blanca (White-label)",
                ],
                popular: false,
              },
            ].map((plan, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className={`bg-black border-gray-800 relative ${plan.popular ? "border-[#C28840]" : ""}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#8B5A2B] text-white">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-white text-2xl">{plan.name}</CardTitle>
                    <div className="text-4xl font-bold text-[#C28840] my-4">{plan.price}</div>
                    <CardDescription className="text-gray-300">{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center">
                          <Check className="h-4 w-4 text-[#C28840] mr-2" />
                          <span className="text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Link href="/contact">
                      <Button
                        className={`w-full ${plan.popular ? "bg-[#C28840] hover:bg-[#8B5A2B]" : "bg-gray-700 hover:bg-gray-600"}`}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who are already building amazing websites with our AI template.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact">
              <Button size="lg" className="bg-[#C28840] hover:bg-[#8B5A2B] text-white">
                Start Building Now
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button
                size="lg"
                variant="outline"
                className="border-[#C28840] text-[#C28840] hover:bg-[#C28840] hover:text-white"
              >
                View Documentation
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
