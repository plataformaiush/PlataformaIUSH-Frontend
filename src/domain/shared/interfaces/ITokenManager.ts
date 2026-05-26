// Interfaz compartida para evitar dependencias cruzadas.
// La implementación real vive en `presentation/services/tokenManager.ts`
// y usa la key `'token'`, que es la que devuelve el backend.

export interface ITokenManager {
  getToken(): string | null
  getAuthHeaders(): Record<string, string>
  isTokenExpired(): boolean
}
