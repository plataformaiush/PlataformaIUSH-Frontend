import axios, { AxiosError } from "axios";
import { tokenManager } from "../services/tokenManager";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api",
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 10000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = tokenManager.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Sesión expirada/invalidada: limpiar credenciales y redirigir a login.
      tokenManager.clearToken();
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith("/login")) {
          const redirect = encodeURIComponent(currentPath + window.location.search);
          window.location.assign(`/login?redirect=${redirect}`);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
