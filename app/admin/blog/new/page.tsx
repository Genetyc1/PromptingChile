"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import Header from "@/components/header"
import Footer from "@/components/footer"
import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { createPost, getAllCategories } from "@/app/actions/blog"
import type { BlogCategory } from "@/app/types/blog"
import { useRouter } from "next/navigation"

export default function NewBlogPostPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    category: "",
    image: "",
    language: "es",
    featured: false,
    published: false,
  })

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const result = await getAllCategories()
        if (result.success && result.data) {
          setCategories(result.data)
        }
      } catch (err) {
        console.error(err)
      }
    }

    fetchCategories()
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSwitchChange = (name: string, checked: boolean) => {
    setFormData((prev) => ({ ...prev, [name]: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const form = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        form.append(key, value.toString())
      })

      const result = await createPost(form)
      if (result.success) {
        router.push("/admin/blog")
      } else {
        alert(result.error || "Error al crear el artículo")
      }
    } catch (err) {
      console.error(err)
      alert("Error al crear el artículo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />

      <main className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center mb-8">
            <Link href="/admin/blog" className="text-[#C28840] hover:text-[#D4A574] mr-4">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-[#C28840] bg-clip-text text-transparent">
              Nuevo Artículo
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <Label htmlFor="title" className="text-gray-400">
                    Título
                  </Label>
                  <Input
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="Título del artículo"
                    required
                    className="bg-gray-900 border-gray-800 focus:border-[#C28840] text-white mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="excerpt" className="text-gray-400">
                    Extracto
                  </Label>
                  <Textarea
                    id="excerpt"
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleChange}
                    placeholder="Breve descripción del artículo"
                    required
                    className="bg-gray-900 border-gray-800 focus:border-[#C28840] text-white mt-1"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="image" className="text-gray-400">
                    URL de la imagen
                  </Label>
                  <Input
                    id="image"
                    name="image"
                    value={formData.image}
                    onChange={handleChange}
                    placeholder="/ruta-a-la-imagen.jpg"
                    required
                    className="bg-gray-900 border-gray-800 focus:border-[#C28840] text-white mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-gray-400">
                      Categoría
                    </Label>
                    <Select value={formData.category} onValueChange={(value) => handleSelectChange("category", value)}>
                      <SelectTrigger className="bg-gray-900 border-gray-800 focus:border-[#C28840] text-white mt-1">
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-800 text-white">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="language" className="text-gray-400">
                      Idioma
                    </Label>
                    <Select value={formData.language} onValueChange={(value) => handleSelectChange("language", value)}>
                      <SelectTrigger className="bg-gray-900 border-gray-800 focus:border-[#C28840] text-white mt-1">
                        <SelectValue placeholder="Seleccionar idioma" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-900 border-gray-800 text-white">
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="en">Inglés</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex space-x-8">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="featured"
                      checked={formData.featured}
                      onCheckedChange={(checked) => handleSwitchChange("featured", checked)}
                    />
                    <Label htmlFor="featured" className="text-gray-400">
                      Destacado
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="published"
                      checked={formData.published}
                      onCheckedChange={(checked) => handleSwitchChange("published", checked)}
                    />
                    <Label htmlFor="published" className="text-gray-400">
                      Publicado
                    </Label>
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="content" className="text-gray-400">
                  Contenido
                </Label>
                <Textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Contenido del artículo..."
                  required
                  className="bg-gray-900 border-gray-800 focus:border-[#C28840] text-white mt-1"
                  rows={20}
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" disabled={isLoading} className="bg-[#C28840] hover:bg-[#8B5A2B] text-white">
                {isLoading ? (
                  "Guardando..."
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Guardar Artículo
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
