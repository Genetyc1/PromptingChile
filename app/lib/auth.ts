import { SignJWT, jwtVerify } from "jose"
import { cookies } from "next/headers"

const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback-secret-key")

export interface User {
  id: string
  email: string
  name: string
  role: "owner" | "admin" | "marketing" | "analyst"
}

const users = [
  { id: "1", email: "admin@promptingchile.cl", password: "admin123", name: "Admin", role: "owner" as const },
  {
    id: "2",
    email: "marketing@promptingchile.cl",
    password: "marketing123",
    name: "Marketing",
    role: "marketing" as const,
  },
  { id: "3", email: "analyst@promptingchile.cl", password: "analyst123", name: "Analyst", role: "analyst" as const },
]

export async function authenticateUser(email: string, password: string): Promise<User | null> {
  const user = users.find((u) => u.email === email && u.password === password)
  return user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null
}

export async function createSession(user: User) {
  const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret)

  cookies().set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24,
  })

  return token
}

export async function verifySession(token: string): Promise<User | null> {
  try {
    const { payload } = await jwtVerify(token, secret)
    const user = users.find((u) => u.id === payload.userId)
    return user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null
  } catch {
    return null
  }
}

export async function getCurrentUser(): Promise<User | null> {
  const token = cookies().get("session")?.value
  return token ? verifySession(token) : null
}

export function deleteSession() {
  cookies().delete("session")
}

export function hasAccess(userRole: string, allowedRoles: string[]): boolean {
  return allowedRoles.includes(userRole)
}

export function getRoleColor(role: string): string {
  const colors = {
    owner: "bg-purple-100 text-purple-800",
    admin: "bg-blue-100 text-blue-800",
    marketing: "bg-green-100 text-green-800",
    analyst: "bg-yellow-100 text-yellow-800",
  }
  return colors[role as keyof typeof colors] || "bg-gray-100 text-gray-800"
}
