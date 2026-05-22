import { ITokenManager } from "../../domain/shared/interfaces/ITokenManager";

export class TokenManager implements ITokenManager {
  private readonly TOKEN_KEY = "token";
  private readonly TOKEN_EXPIRES_KEY = "token_expires";
  private readonly USER_KEY = "user";

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  setToken(token: string, expiresIn: number = 86400): void {
    localStorage.setItem(this.TOKEN_KEY, token);

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
    const expiresAt = localStorage.getItem(this.TOKEN_EXPIRES_KEY);
    if (!expiresAt) return true;

    return new Date() > new Date(expiresAt);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
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
