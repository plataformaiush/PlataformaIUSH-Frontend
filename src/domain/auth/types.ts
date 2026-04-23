// Seguridad Bearer Token - Requisito del correo

export interface AuthState {
  token: string | null
  refreshToken: string | null
  user: User | null
  expiresAt: Date | null
  isAuthenticated: boolean
  permissions: Permission[]
}

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
  institutionId: string
  avatar?: string
  lastLogin?: Date
  isActive: boolean
}

export type UserRole = 
  | 'super_admin'   // Vista institución (Equipo 3)
  | 'admin'         // Vista administrador (Equipo 4)
  | 'teacher'       // Vista docente (Equipo 6)
  | 'student'       // Vista estudiante (Equipo 10)

export interface Permission {
  id: string
  name: string
  resource: string
  action: string
}

export interface LoginCredentials {
  email: string
  password: string
  institutionCode?: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
  expiresAt: string
  permissions: Permission[]
}

// Bearer Token management
export class TokenManager {
  static getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  static setToken(token: string, expiresAt: Date): void {
    localStorage.setItem('auth_token', token)
    localStorage.setItem('token_expires', expiresAt.toISOString())
  }

  static removeToken(): void {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('token_expires')
    localStorage.removeItem('refresh_token')
  }

  static isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires')
    if (!expiresAt) return true
    
    return new Date() > new Date(expiresAt)
  }

  static getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  static async refreshTokenIfNeeded(): Promise<boolean> {
    if (!this.isTokenExpired()) return true
    
    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return false
    
    try {
      // Lógica para refresh token
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      })
      
      if (response.ok) {
        const data: LoginResponse = await response.json()
        this.setToken(data.token, new Date(data.expiresAt))
        return true
      }
    } catch (error) {
      console.error('Error refreshing token:', error)
    }
    
    this.removeToken()
    return false
  }
}

// Permisos por rol
export const rolePermissions: Record<UserRole, string[]> = {
  super_admin: [
    'institutions:read', 'institutions:write', 'institutions:delete',
    'users:read', 'users:write', 'users:delete',
    'courses:read', 'courses:write', 'courses:delete',
    'analytics:read', 'reports:read'
  ],
  admin: [
    'users:read', 'users:write',
    'courses:read', 'courses:write',
    'reports:read'
  ],
  teacher: [
    'courses:read', 'courses:write',
    'modules:read', 'modules:write',
    'contents:read', 'contents:write',
    'grades:read', 'grades:write'
  ],
  student: [
    'courses:read',
    'modules:read',
    'contents:read',
    'grades:read'
  ]
}
