"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, Edit, Eye, Plus, Search, Trash2, RefreshCw, RotateCcw } from "lucide-react"
import { getAllPosts, deletePost } from "@/app/actions/blog"
import { BlogService } from "@/app/services/blog-service"
import type { BlogPost } from "@/app/types/blog"

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPosts = async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      console.log("🔄 Cargando posts del blog...")
      const result = await getAllPosts()
      if (result.success && result.data) {
        console.log(`✅ Posts cargados: ${result.data.length}`)
        setPosts(result.data)
        setFilteredPosts(result.data)
      } else {
        setError(result.error || "Error al cargar los artículos")
      }
    } catch (err) {
      setError("Error al cargar los artículos")
      console.error("❌ Error:", err)
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchPosts()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = posts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          post.category.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      setFilteredPosts(filtered)
    } else {
      setFilteredPosts(posts)
    }
  }, [searchTerm, posts])

  const handleRefresh = () => {
    fetchPosts(true)
  }

  const handleResetData = async () => {
    if (
      window.confirm(
        "¿Estás seguro de que deseas resetear todos los artículos a los valores iniciales? Esta acción no se puede deshacer.",
      )
    ) {
      try {
        await BlogService.resetToInitialData()
        fetchPosts(true)
      } catch (err) {
        console.error(err)
        alert("Error al resetear los datos")
      }
    }
  }

  const handleDelete = async (id: string) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este artículo? Esta acción no se puede deshacer.")) {
      try {
        const result = await deletePost(id)
        if (result.success) {
          setPosts((prevPosts) => prevPosts.filter((post) => post.id !== id))
        } else {
          alert(result.error || "Error al eliminar el artículo")
        }
      } catch (err) {
        console.error(err)
        alert("Error al eliminar el artículo")
      }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <Link href="/admin" className="text-[#C28840] hover:text-[#D4A574] mr-4">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
                Gestión de Blog
              </h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleRefresh}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800"
                disabled={isRefreshing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
                {isRefreshing ? "Actualizando..." : "Actualizar"}
              </Button>
              <Button
                onClick={handleResetData}
                variant="outline"
                className="border-gray-700 hover:bg-gray-800 text-yellow-400"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Resetear
              </Button>
              {/* Información de persistencia */}
              <Link href="/admin/blog/new">
                <Button className="bg-[#C28840] hover:bg-[#8B5A2B] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Artículo
                </Button>
              </Link>
            </div>
          </div>

          {/* Información de persistencia */}
          <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-lg">
            <p className="text-blue-400 text-sm">
              💾 <strong>Datos Persistentes:</strong> Los artículos se guardan automáticamente en localStorage y se
              mantienen entre sesiones. Usa el botón "Resetear" para volver a los artículos iniciales con contenido
              completo.
            </p>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Buscar artículos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-gray-900 border-gray-800 focus:border-[#C28840] text-white"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-400">Cargando artículos...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-red-400">{error}</p>
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-400">No se encontraron artículos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredPosts.map((post) => (
                <Card key={post.id} className="bg-gray-900 border-gray-800">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div
                          className="w-16 h-16 rounded-md bg-cover bg-center"
                          style={{ backgroundImage: `url(${post.image})` }}
                        ></div>
                        <div>
                          <h3 className="font-medium text-white">{post.title}</h3>
                          <div className="flex items-center text-sm text-gray-400 mt-1">
                            <span
                              className={`inline-block w-2 h-2 rounded-full mr-2 ${
                                post.published ? "bg-green-500" : "bg-yellow-500"
                              }`}
                            ></span>
                            <span>{post.published ? "Publicado" : "Borrador"}</span>
                            <span className="mx-2">•</span>
                            <span>{post.date}</span>
                            <span className="mx-2">•</span>
                            <span
                              className="px-2 py-0.5 text-xs rounded-full"
                              style={{ backgroundColor: "rgba(194, 136, 64, 0.2)", color: "#C28840" }}
                            >
                              {post.category}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Link href={`/blog/${post.slug}`} target="_blank">
                          <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/admin/blog/edit/${post.id}`}>
                          <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-700 hover:bg-red-900/20"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
