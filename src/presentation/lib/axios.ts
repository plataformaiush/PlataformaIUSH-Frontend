import axios from "axios";
import { TokenManager } from "../../domain/auth/types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const headers = TokenManager.getAuthHeaders();
  if (headers.Authorization) {
    config.headers.Authorization = headers.Authorization;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refreshed = await TokenManager.refreshTokenIfNeeded();
      if (refreshed && error.config) {
        const headers = TokenManager.getAuthHeaders();
        error.config.headers.Authorization = headers.Authorization;
        return api(error.config);
      }
    }
    return Promise.reject(error);
  },
);

export default api;
