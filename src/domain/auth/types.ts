// Tipos compartidos de autenticación.
// El contrato real con el backend usa los valores PascalCase en español
// definidos en `domain/shared/enums/UserRole.enum.ts`.
// La gestión efectiva del token vive en `presentation/services/tokenManager.ts`.

import { UserRole } from '../shared/enums/UserRole.enum'

export type { UserRole }

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

// Permisos por rol (alineados con valores reales del backend)
export const rolePermissions: Record<UserRole, string[]> = {
  [UserRole.SUPER_ADMIN]: [
    'institutions:read', 'institutions:write', 'institutions:delete',
    'users:read', 'users:write', 'users:delete',
    'courses:read', 'courses:write', 'courses:delete',
    'analytics:read', 'reports:read'
  ],
  [UserRole.ADMIN]: [
    'users:read', 'users:write',
    'courses:read', 'courses:write',
    'reports:read'
  ],
  [UserRole.DOCENTE]: [
    'courses:read', 'courses:write',
    'modules:read', 'modules:write',
    'contents:read', 'contents:write',
    'grades:read', 'grades:write'
  ],
  [UserRole.ESTUDIANTE]: [
    'courses:read',
    'modules:read',
    'contents:read',
    'grades:read'
  ]
}
