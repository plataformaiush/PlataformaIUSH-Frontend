// Token Manager temporal mientras no está implementado el sistema de login
// SISTEMA HÍBRIDO DE SEGURIDAD:
// - Token de acceso: En memoria (se pierde al recargar, protegido contra XSS)
// - Refresh token: En sessionStorage (persiste en la sesión del navegador)

const REFRESH_TOKEN_KEY = 'refreshToken'

export class TokenManager {
  // Token de acceso almacenado en memoria (no accesible desde JavaScript malicioso)
  private static accessToken: string | null = null

  /**
   * Inicializa un token temporal en memoria si no existe
   * NOTA: Esta es una solución temporal para desarrollo
   * Debe ser reemplazada cuando se implemente el sistema de login real
   */
  static initializeTemporaryToken(): void {
    // Token temporal para desarrollo obtenido de Swagger
    const temporaryToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJVU1IwMDEiLCJjb3JyZW8iOiJzdXBlcmFkbWluQGRlbW8uZWR1Iiwibm9tYnJlIjoiU3VwZXIgQWRtaW4iLCJyb2xlcyI6WyJTdXBlckFkbWluIl0sInBlcm1pc29zIjpbImNvbXBldGVuY2lhcy5nZXN0aW9uYXIiLCJwYXJhbWV0cm9zLmdsb2JhbGVzLmdlc3Rpb25hciIsInBlcm1pc29zLnZlciIsInJvbGVzLnZlciIsInNpc3RlbWEucGVyc29uYWxpemFyIiwidXN1YXJpb3MuYXNpZ25hclJvbGVzIiwidXN1YXJpb3MuY3JlYXIiLCJ1c3Vhcmlvcy52ZXIiXSwiaWF0IjoxNzc3NDc4MjU4LCJleHAiOjE3Nzc1NjQ2NTh9.Qxxs_1tvie2RFF0j12tE66z75vwO4zBpnpR9KOs3Lzg'
    this.accessToken = temporaryToken
    console.warn(
      '[DEV] Token temporal inicializado en memoria (Super Admin). Reemplazar cuando el login esté implementado.'
    )
  }

  /**
   * Obtiene el token de acceso desde memoria
   * @returns Token de acceso o null si no existe
   */
  static getToken(): string | null {
    return this.accessToken
  }

  /**
   * Establece el token de acceso en memoria
   * @param token Token a guardar
   */
  static setToken(token: string): void {
    this.accessToken = token
  }

  /**
   * Obtiene el refresh token desde sessionStorage
   * @returns Refresh token o null si no existe
   */
  static getRefreshToken(): string | null {
    if (typeof sessionStorage === 'undefined') return null
    return sessionStorage.getItem(REFRESH_TOKEN_KEY)
  }

  /**
   * Establece el refresh token en sessionStorage
   * @param refreshToken Refresh token a guardar
   */
  static setRefreshToken(refreshToken: string): void {
    if (typeof sessionStorage === 'undefined') return
    sessionStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
  }

  /**
   * Limpia tanto el token de acceso como el refresh token
   */
  static clearTokens(): void {
    this.accessToken = null
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(REFRESH_TOKEN_KEY)
    }
  }

  /**
   * Verifica si hay un token de acceso disponible
   * @returns true si el token existe, false en caso contrario
   */
  static isTokenAvailable(): boolean {
    return !!this.accessToken
  }
}
