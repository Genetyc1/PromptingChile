"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Calendar, Clock, ArrowRight } from "lucide-react"
import Header from "@/components/header"
import Footer from "@/components/footer"
import NewsletterForm from "@/components/newsletter-form"

// Artículos estáticos definidos directamente
const staticArticles = [
  {
    id: "1",
    title: "IA Generativa: La Clave de la Transformación Digital para PYMEs en Latinoamérica",
    excerpt:
      "Análisis profundo sobre cómo las pequeñas y medianas empresas latinoamericanas están adoptando la inteligencia artificial generativa para competir globalmente.",
    slug: "ia-generativa-transformacion-digital-pymes-latinoamerica",
    date: "10 Enero 2024",
    readTime: "12 min de lectura",
    category: "Tendencias",
    image: "/ia-generativa-pymes-latinoamerica.png",
    published: true,
  },
  {
    id: "2",
    title: "Cómo la Ingeniería de Prompts Revoluciona la Productividad Empresarial en 2024",
    excerpt:
      "Descubre las últimas técnicas de prompt engineering que están transformando la manera en que las empresas automatizan procesos y mejoran su eficiencia operacional.",
    slug: "prompt-engineering-revoluciona-productividad-empresarial-2024",
    date: "15 Enero 2024",
    readTime: "8 min de lectura",
    category: "Artículo",
    image: "/blog-ai-productivity-new.png",
    published: true,
  },
  {
    id: "3",
    title: "The Future of Prompt Engineering in Enterprise Automation",
    excerpt:
      "How Fortune 500 companies are leveraging sophisticated prompt engineering to automate complex business processes and drive innovation.",
    slug: "future-prompt-engineering-enterprise-automation-2024",
    date: "January 8, 2024",
    readTime: "15 min read",
    category: "Enterprise",
    image: "/future-prompt-engineering-enterprise-automation.png",
    published: true,
  },
  {
    id: "4",
    title: "Advanced Prompt Techniques That Boost ChatGPT Performance by 300%",
    excerpt:
      "Explore cutting-edge prompt engineering strategies backed by recent research that dramatically improve AI model outputs for business applications.",
    slug: "advanced-prompt-techniques-boost-chatgpt-performance",
    date: "January 12, 2024",
    readTime: "10 min read",
    category: "Research",
    image: "/advanced-prompt-techniques-chatgpt-300.jpg",
    published: true,
  },
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-gray-400 text-lg mb-4"
            >
              Blog
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent"
            >
              Unlock AI Insights with Us
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-xl text-gray-300 max-w-2xl mx-auto"
            >
              Stay informed with the latest AI developments, prompt engineering techniques, and business automation
              insights
            </motion.p>
          </div>

          {/* Articles Grid */}
          <div className="grid md:grid-cols-2 gap-8">
            {staticArticles.map((article, index) => (
              <motion.article
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-gray-900 rounded-lg overflow-hidden border border-gray-800 hover:border-[#C28840] transition-colors group"
              >
                <Link href={`/blog/${article.slug}`}>
                  <div className="relative">
                    <img
                      src={article.image || "/placeholder.svg"}
                      alt={article.title}
                      className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#C28840] text-black px-3 py-1 rounded-full text-sm font-medium">
                        {article.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center text-gray-400 text-sm mb-3">
                      <Calendar className="h-4 w-4 mr-2" />
                      <span>{article.date}</span>
                      <Clock className="h-4 w-4 ml-4 mr-2" />
                      <span>{article.readTime}</span>
                    </div>
                    <h2 className="text-xl font-bold text-white mb-3 group-hover:text-[#C28840] transition-colors">
                      {article.title}
                    </h2>
                    <p className="text-gray-300 mb-4 line-clamp-3">{article.excerpt}</p>
                    <div className="flex items-center text-[#C28840] font-medium">
                      <span>Leer más</span>
                      <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              </motion.article>
            ))}
          </div>

          {/* Newsletter CTA */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="mt-16"
          >
            <NewsletterForm source="blog" />
          </motion.section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
