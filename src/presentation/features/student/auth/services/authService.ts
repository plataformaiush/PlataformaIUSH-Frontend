import { createAxiosInstance } from "../../../../../presentation/services/axiosInterceptor";

const API_URL = "http://localhost:3000";

// Crear instancia de axios con interceptores
export const axiosInstance = createAxiosInstance(API_URL);

interface LoginResponse {
  token: string;
  token_expires?: string; // ISO string — lo que el backend realmente devuelve
  user: {
    id: string;
    correo: string;
    nombre?: string;
    roles?: string[];
  };
  expiresIn?: number; // El backend no lo envía actualmente (usa token_expires)
}

/**
 * Realiza login del usuario
 * @param data - Correo y contraseña
 * @returns Token y datos del usuario
 */
export const loginRequest = async (data: {
  correo: string;
  contrasena: string;
}): Promise<LoginResponse> => {
  const response = await axiosInstance.post<LoginResponse>(
    `/api/auth/login`,
    data
  );
  return response.data;
};

/**
 * Realiza logout del usuario
 */
export const logoutRequest = async (): Promise<void> => {
  // TODO: llamar POST /api/auth/logout cuando el backend lo implemente.
  // Por ahora el token expira naturalmente; la sesión local se limpia en el caller.
};