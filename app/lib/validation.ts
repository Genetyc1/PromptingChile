import { z } from "zod"

// User validation schemas
export const userSchemas = {
  create: z.object({
    name: z.string().min(2, "Nombre debe tener al menos 2 caracteres").max(50),
    email: z.string().email("Email inválido").max(100),
    password: z
      .string()
      .min(8, "Contraseña debe tener al menos 8 caracteres")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Contraseña debe contener mayúscula, minúscula, número y símbolo",
      ),
    role: z.enum(["owner", "admin", "marketing", "analyst"]),
  }),

  update: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().max(100).optional(),
    password: z
      .string()
      .min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .optional(),
    role: z.enum(["owner", "admin", "marketing", "analyst"]).optional(),
    isActive: z.boolean().optional(),
  }),

  login: z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(1, "Contraseña requerida"),
  }),
}

// Settings validation schema
export const settingsSchema = z.object({
  siteName: z.string().min(1, "Nombre del sitio requerido").max(100),
  siteDescription: z.string().max(500),
  siteUrl: z.string().url("URL inválida"),
  adminEmail: z.string().email("Email de admin inválido"),
  maintenanceMode: z.boolean(),
  registrationEnabled: z.boolean(),
  emailNotifications: z.boolean(),
  theme: z.enum(["light", "dark"]),
  language: z.enum(["es", "en"]),
  timezone: z.string(),
})

// Blog validation schema
export const blogSchema = z.object({
  title: z.string().min(1, "Título requerido").max(200),
  content: z.string().min(1, "Contenido requerido"),
  excerpt: z.string().max(500),
  slug: z.string().min(1, "Slug requerido").max(100),
  published: z.boolean(),
  tags: z.array(z.string()).optional(),
})

// Newsletter validation schema
export const newsletterSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nombre requerido").max(100).optional(),
})
