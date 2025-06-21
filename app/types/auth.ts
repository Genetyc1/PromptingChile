export type UserRole = "owner" | "admin" | "marketing" | "analyst"

export interface User {
  id: string
  email: string
  name?: string
  role: UserRole
  image?: string
  provider?: string
  createdAt: Date
  lastLogin?: Date
  isActive: boolean
}

export interface LoginAttempt {
  id: string
  email: string
  success: boolean
  ipAddress: string
  userAgent: string
  timestamp: Date
  failureReason?: string
}

export interface AuditLog {
  id: string
  userId: string
  userEmail: string
  action: string
  resource: string
  resourceId?: string
  details: Record<string, any>
  ipAddress: string
  userAgent: string
  timestamp: Date
}

export interface BackupRecord {
  id: string
  filename: string
  size: number
  createdBy: string
  createdAt: Date
  type: "manual" | "automatic"
  status: "completed" | "failed" | "in_progress"
  downloadUrl?: string
}

export interface Integration {
  id: string
  name: string
  type: "plugin" | "api"
  status: "active" | "inactive" | "error"
  config: Record<string, any>
  installedAt: Date
  version?: string
}

export interface ApiConnection {
  id: string
  name: string
  endpoint: string
  method: "GET" | "POST" | "PUT" | "DELETE"
  headers: Record<string, string>
  isActive: boolean
  lastTested?: Date
  testStatus?: "success" | "failed"
}
