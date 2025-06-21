"use server"

import { BlogService } from "../services/blog-service"
import { revalidatePath } from "next/cache"

// Obtener todos los posts
export async function getAllPosts() {
  try {
    const posts = await BlogService.getAllPosts()
    return { success: true, data: posts }
  } catch (error) {
    console.error("Error al obtener posts:", error)
    return { success: false, error: "Error al obtener los posts" }
  }
}

// Obtener un post por ID
export async function getPostById(id: string) {
  try {
    const post = await BlogService.getPostById(id)
    if (!post) {
      return { success: false, error: "Post no encontrado" }
    }
    return { success: true, data: post }
  } catch (error) {
    console.error(`Error al obtener post ${id}:`, error)
    return { success: false, error: "Error al obtener el post" }
  }
}

// Crear un nuevo post
export async function createPost(formData: FormData) {
  try {
    const title = formData.get("title") as string
    const excerpt = formData.get("excerpt") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string
    const image = formData.get("image") as string
    const language = formData.get("language") as string
    const featured = formData.get("featured") === "true"
    const published = formData.get("published") === "true"

    // Generar slug a partir del título
    const slug = title
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")

    // Calcular tiempo de lectura (aproximado)
    const wordCount = content.split(/\s+/).length
    const readTimeMinutes = Math.ceil(wordCount / 200) // Asumiendo 200 palabras por minuto
    const readTime = `${readTimeMinutes} min`

    // Fecha actual formateada
    const today = new Date()
    const date = today.toLocaleDateString("es-ES", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })

    const newPost = await BlogService.createPost({
      slug,
      title,
      excerpt,
      content,
      category,
      image,
      date,
      readTime,
      language,
      featured,
      published,
    })

    revalidatePath("/admin/blog")
    revalidatePath("/blog")

    return { success: true, data: newPost }
  } catch (error) {
    console.error("Error al crear post:", error)
    return { success: false, error: "Error al crear el post" }
  }
}

// Actualizar un post existente
export async function updatePost(id: string, formData: FormData) {
  try {
    const title = formData.get("title") as string
    const excerpt = formData.get("excerpt") as string
    const content = formData.get("content") as string
    const category = formData.get("category") as string
    const image = formData.get("image") as string
    const language = formData.get("language") as string
    const featured = formData.get("featured") === "true"
    const published = formData.get("published") === "true"

    // Actualizar slug solo si cambió el título
    let slug
    const currentPost = await BlogService.getPostById(id)
    if (currentPost && currentPost.title !== title) {
      slug = title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
    }

    // Calcular tiempo de lectura si cambió el contenido
    let readTime
    if (currentPost && currentPost.content !== content) {
      const wordCount = content.split(/\s+/).length
      const readTimeMinutes = Math.ceil(wordCount / 200)
      readTime = `${readTimeMinutes} min`
    }

    const updatedPost = await BlogService.updatePost(id, {
      title,
      excerpt,
      content,
      category,
      image,
      language,
      featured,
      published,
      ...(slug && { slug }),
      ...(readTime && { readTime }),
    })

    if (!updatedPost) {
      return { success: false, error: "Post no encontrado" }
    }

    revalidatePath("/admin/blog")
    revalidatePath(`/blog/${updatedPost.slug}`)
    revalidatePath("/blog")

    return { success: true, data: updatedPost }
  } catch (error) {
    console.error(`Error al actualizar post ${id}:`, error)
    return { success: false, error: "Error al actualizar el post" }
  }
}

// Eliminar un post
export async function deletePost(id: string) {
  try {
    const post = await BlogService.getPostById(id)
    const success = await BlogService.deletePost(id)

    if (!success) {
      return { success: false, error: "Post no encontrado" }
    }

    revalidatePath("/admin/blog")
    revalidatePath("/blog")
    if (post) {
      revalidatePath(`/blog/${post.slug}`)
    }

    return { success: true }
  } catch (error) {
    console.error(`Error al eliminar post ${id}:`, error)
    return { success: false, error: "Error al eliminar el post" }
  }
}

// Obtener todas las categorías
export async function getAllCategories() {
  try {
    const categories = await BlogService.getAllCategories()
    return { success: true, data: categories }
  } catch (error) {
    console.error("Error al obtener categorías:", error)
    return { success: false, error: "Error al obtener las categorías" }
  }
}

// Crear una nueva categoría
export async function createCategory(formData: FormData) {
  try {
    const name = formData.get("name") as string

    // Generar slug a partir del nombre
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s]/gi, "")
      .replace(/\s+/g, "-")

    const newCategory = await BlogService.createCategory({
      name,
      slug,
    })

    revalidatePath("/admin/blog/categories")

    return { success: true, data: newCategory }
  } catch (error) {
    console.error("Error al crear categoría:", error)
    return { success: false, error: "Error al crear la categoría" }
  }
}

// Eliminar una categoría
export async function deleteCategory(id: string) {
  try {
    const success = await BlogService.deleteCategory(id)

    if (!success) {
      return { success: false, error: "Categoría no encontrada" }
    }

    revalidatePath("/admin/blog/categories")

    return { success: true }
  } catch (error) {
    console.error(`Error al eliminar categoría ${id}:`, error)
    return { success: false, error: "Error al eliminar la categoría" }
  }
}
