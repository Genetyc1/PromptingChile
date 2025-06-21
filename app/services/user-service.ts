import bcrypt from "bcryptjs"
import type { User } from "../types/auth"
import { DatabaseService } from "./database-service"

export const UserService = {
  // Get all users
  async getAllUsers(): Promise<User[]> {
    try {
      console.log("📋 Fetching all users...")
      const users = await DatabaseService.getUsers()
      console.log(`✅ Found ${users?.length || 0} users`)
      return users || []
    } catch (error) {
      console.error("❌ Error fetching users:", error)
      return []
    }
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<(User & { password_hash?: string }) | null> {
    try {
      console.log("🔍 Looking for user with email:", email)
      const user = await DatabaseService.getUserByEmail(email)
      console.log(user ? "✅ User found" : "❌ User not found")
      return user
    } catch (error) {
      console.error("❌ Error fetching user by email:", error)
      return null
    }
  },

  // Get user by ID
  async getUserById(id: string): Promise<User | null> {
    try {
      const users = await DatabaseService.getUsers()
      const user = users?.find((u) => u.id === id)
      return user || null
    } catch (error) {
      console.error("❌ Error fetching user by ID:", error)
      return null
    }
  },

  // Create new user
  async createUser(userData: Omit<User, "id" | "createdAt"> & { password: string }): Promise<User> {
    try {
      console.log("🔐 UserService.createUser started for:", userData.email)

      // Validate input data
      if (!userData.email || !userData.password || !userData.role) {
        throw new Error("Missing required fields: email, password, or role")
      }

      console.log("🔐 Hashing password...")
      const passwordHash = await bcrypt.hash(userData.password, 12)
      console.log("✅ Password hashed successfully")

      const newUser = {
        email: userData.email,
        name: userData.name,
        password_hash: passwordHash,
        role: userData.role,
        is_active: userData.isActive ?? true,
        provider: userData.provider || "credentials",
        created_at: new Date().toISOString(),
      }

      console.log("💾 Calling DatabaseService.createUser...")
      console.log("📝 User data to save:", { ...newUser, password_hash: "[HIDDEN]" })

      const createdUser = await DatabaseService.createUser(newUser)
      console.log("✅ DatabaseService.createUser completed")
      console.log("📋 Created user data:", {
        id: createdUser.id,
        email: createdUser.email,
        role: createdUser.role,
      })

      // Transform and return user data
      const { password_hash, ...userWithoutPassword } = createdUser
      const transformedUser = {
        ...userWithoutPassword,
        isActive: createdUser.is_active,
        createdAt: new Date(createdUser.created_at),
        lastLogin: createdUser.last_login ? new Date(createdUser.last_login) : undefined,
      }

      console.log("✅ User transformation completed")
      return transformedUser
    } catch (error) {
      console.error("❌ UserService.createUser failed:", error)

      // Enhanced error handling
      if (error instanceof Error) {
        console.error("❌ Error details:", {
          message: error.message,
          stack: error.stack?.split("\n").slice(0, 5).join("\n"), // First 5 lines of stack
        })

        // Re-throw with more specific messages
        if (error.message.includes("duplicate key") || error.message.includes("unique")) {
          throw new Error("Email ya está en uso")
        } else if (error.message.includes("invalid input") || error.message.includes("constraint")) {
          throw new Error("Datos de usuario inválidos")
        } else if (error.message.includes("connection") || error.message.includes("network")) {
          throw new Error("Error de conexión a la base de datos")
        } else if (error.message.includes("permission") || error.message.includes("policy")) {
          throw new Error("Error de permisos en la base de datos")
        }
      }

      throw new Error(`Failed to create user: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  },

  // Update user
  async updateUser(id: string, userData: Partial<User & { password?: string }>): Promise<User | null> {
    try {
      const updateData: any = {}

      if (userData.name) updateData.name = userData.name
      if (userData.email) updateData.email = userData.email
      if (userData.role) updateData.role = userData.role
      if (typeof userData.isActive === "boolean") updateData.is_active = userData.isActive
      if (userData.password) {
        updateData.password_hash = await bcrypt.hash(userData.password, 12)
      }

      updateData.updated_at = new Date().toISOString()

      const updatedUser = await DatabaseService.updateUser(id, updateData)

      if (!updatedUser) return null

      const { password_hash, ...userWithoutPassword } = updatedUser
      return {
        ...userWithoutPassword,
        isActive: updatedUser.is_active,
        createdAt: new Date(updatedUser.created_at),
        lastLogin: updatedUser.last_login ? new Date(updatedUser.last_login) : undefined,
      }
    } catch (error) {
      console.error("❌ Error updating user:", error)
      return null
    }
  },

  // Delete user
  async deleteUser(id: string): Promise<boolean> {
    try {
      // Check if user is owner
      const user = await this.getUserById(id)
      if (user?.role === "owner") {
        console.log("❌ Cannot delete owner user")
        return false
      }

      await DatabaseService.deleteUser(id)
      console.log("✅ User deleted successfully")
      return true
    } catch (error) {
      console.error("❌ Error deleting user:", error)
      return false
    }
  },

  // Update last login
  async updateLastLogin(id: string): Promise<void> {
    try {
      await DatabaseService.updateUser(id, {
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("❌ Error updating last login:", error)
    }
  },

  // Toggle user status
  async toggleUserStatus(id: string): Promise<User | null> {
    try {
      const user = await this.getUserById(id)
      if (!user || user.role === "owner") {
        return null
      }

      return await this.updateUser(id, { isActive: !user.isActive })
    } catch (error) {
      console.error("❌ Error toggling user status:", error)
      return null
    }
  },

  // Verify password
  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email)
      if (!user || !user.password_hash) {
        return null
      }

      const isValid = await bcrypt.compare(password, user.password_hash)
      if (!isValid) {
        return null
      }

      // Update last login
      await this.updateLastLogin(user.id)

      const { password_hash, ...userWithoutPassword } = user
      return {
        ...userWithoutPassword,
        isActive: user.is_active,
        createdAt: new Date(user.created_at),
        lastLogin: new Date(),
      }
    } catch (error) {
      console.error("❌ Error verifying password:", error)
      return null
    }
  },
}
