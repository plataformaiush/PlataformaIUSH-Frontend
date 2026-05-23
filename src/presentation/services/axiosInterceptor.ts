import axios, { AxiosError, AxiosInstance } from "axios";
import { tokenManager } from "./tokenManager";
import { useAuthStore } from "../stores/auth.store";

export function setupAxiosInterceptors(axiosInstance: AxiosInstance): void {
  axiosInstance.interceptors.request.use(
    (config) => {
      const token = tokenManager.getToken();
      const headers = config.headers ?? {};
      const existingAuth =
        (headers as Record<string, string>).Authorization ||
        (headers as Record<string, string>).authorization;

      if (token && !existingAuth) {
        (headers as Record<string, string>).Authorization = `Bearer ${token}`;
      }

      config.headers = headers;
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        useAuthStore.getState().logout();
        try {
          window.history.pushState({}, "", "/login");
          window.dispatchEvent(new PopStateEvent("popstate"));
        } catch (e) {
          // Fallback to a hard navigation if history API fails for any reason
          window.location.href = "/login";
        }
      }

      return Promise.reject(error);
    }
  );
}

export const createAxiosInstance = (baseURL: string): AxiosInstance => {
  const instance = axios.create({
    baseURL,
    timeout: 10000,
  });

  setupAxiosInterceptors(instance);
  return instance;
};
