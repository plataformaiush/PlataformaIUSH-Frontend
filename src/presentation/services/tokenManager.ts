import { ITokenManager } from "@domain/shared/interfaces/ITokenManager";

export class TokenManager implements ITokenManager {
  private readonly DEV_TEST_TOKEN = "token-estudiante-001";
  private readonly TOKEN_KEY = "token";
  private readonly LEGACY_TOKEN_KEYS = ["auth_token", "access_token"];
  private readonly TOKEN_EXPIRES_KEY = "token_expires";
  private readonly USER_KEY = "user";

  getToken(): string | null {
    // Override temporal para pruebas: fuerza el token de estudiante en todas las requests.
    return this.DEV_TEST_TOKEN;
  }

  setToken(token: string, expiresIn: number = 86400): void {
    localStorage.setItem(this.TOKEN_KEY, token);
    this.LEGACY_TOKEN_KEYS.forEach((key) => localStorage.setItem(key, token));

    let expiresAt: Date;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      expiresAt = payload.exp
        ? new Date(payload.exp * 1000)
        : new Date(Date.now() + expiresIn * 1000);
    } catch {
      expiresAt = new Date(Date.now() + expiresIn * 1000);
    }

    localStorage.setItem(this.TOKEN_EXPIRES_KEY, expiresAt.toISOString());
  }

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  isTokenExpired(): boolean {
    return false;
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    this.LEGACY_TOKEN_KEYS.forEach((key) => localStorage.removeItem(key));
    localStorage.removeItem(this.TOKEN_EXPIRES_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  setUser(user: unknown): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getUser(): unknown | null {
    const userStr = localStorage.getItem(this.USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  }
}

export const tokenManager = new TokenManager();
