// Interfaz compartida para evitar dependencias cruzadas

export interface ITokenManager {
  getToken(): string | null
  getAuthHeaders(): Record<string, string>
  isTokenExpired(): boolean
}

// Implementación mock para desarrollo
export class MockTokenManager implements ITokenManager {
  getToken(): string | null {
    return localStorage.getItem('auth_token')
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken()
    return token ? { 'Authorization': `Bearer ${token}` } : {}
  }

  isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem('token_expires')
    if (!expiresAt) return true
    return new Date() > new Date(expiresAt)
  }
}
