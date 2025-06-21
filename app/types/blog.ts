export type BlogPost = {
  id: string
  slug: string
  title: string
  excerpt: string
  content: string
  category: string
  image: string
  date: string
  readTime: string
  language: string
  featured: boolean
  published: boolean
}

export type BlogCategory = {
  id: string
  name: string
  slug: string
}
