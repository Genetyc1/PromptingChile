import type { NextRequest } from "next/server"

// Rate limiting storage
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export const rateLimit = {
  check: (identifier: string, limit = 10, windowMs = 60000): boolean => {
    const now = Date.now()
    const key = identifier
    const record = rateLimitStore.get(key)

    if (!record || now > record.resetTime) {
      rateLimitStore.set(key, { count: 1, resetTime: now + windowMs })
      return true
    }

    if (record.count >= limit) {
      return false
    }

    record.count++
    return true
  },

  getClientIP: (request: NextRequest): string => {
    const forwarded = request.headers.get("x-forwarded-for")
    const realIP = request.headers.get("x-real-ip")

    if (forwarded) {
      return forwarded.split(",")[0].trim()
    }

    if (realIP) {
      return realIP
    }

    return request.ip || "unknown"
  },
}

// CSRF Token generation and validation
export const csrf = {
  generateToken: (): string => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  },

  validateToken: (token: string, sessionToken: string): boolean => {
    // Simple validation - in production use more sophisticated method
    return token && sessionToken && token.length > 10
  },
}

// Input sanitization
export const sanitize = {
  html: (input: string): string => {
    return input
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#x27;")
      .replace(/\//g, "&#x2F;")
  },

  sql: (input: string): string => {
    return input.replace(/['";\\]/g, "")
  },
}

// Security headers
export const securityHeaders = {
  "Content-Security-Policy":
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:;",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-XSS-Protection": "1; mode=block",
}
