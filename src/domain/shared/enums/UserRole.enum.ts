/**
 * Roles del sistema.
 *
 * Los valores DEBEN coincidir EXACTAMENTE con los del backend
 * (`src/config/constants.js` → ROLES). El backend usa PascalCase en español.
 */
export enum UserRole {
  SUPER_ADMIN = 'SuperAdmin',
  ADMIN = 'Admin',
  DOCENTE = 'Docente',
  ESTUDIANTE = 'Estudiante',
}

export const USER_ROLE_VALUES = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.DOCENTE,
  UserRole.ESTUDIANTE,
] as const

export type UserRoleValue = `${UserRole}`
