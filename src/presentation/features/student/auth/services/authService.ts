import { createAxiosInstance } from "../../../../../presentation/services/axiosInterceptor";

const API_URL = "http://localhost:3000";

// Crear instancia de axios con interceptores
export const axiosInstance = createAxiosInstance(API_URL);

interface LoginResponse {
  token: string;
  user: {
    id: string;
    correo: string;
    nombre?: string;
    roles?: string[];
  };
  expiresIn?: number; // Segundos hasta expiración
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
  try {
    await axiosInstance.post(`/api/auth/logout`);
  } catch (error) {
    // Aunque falle la solicitud, limpiamos la sesión local
    console.error("Error al hacer logout en servidor:", error);
  }
};