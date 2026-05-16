import {
  mapTeacherDashboardSummaryResponse,
  mapTeacherHealthResponse,
} from "../../../../domain/teacher/teacherMappers";
import { TeacherRepository } from "../../../../domain/teacher/teacherRepository";
import {
  TeacherDashboardData,
  TeacherHealthResponse,
} from "../../../../domain/teacher/teacherTypes";

type RuntimeImportMeta = ImportMeta & {
  env?: {
    VITE_API_BASE_URL?: string;
  };
};

const runtimeEnv = import.meta as RuntimeImportMeta;

/**
 * Si existe VITE_API_BASE_URL, se usa.
 * Si no existe, se usa el backend local por defecto.
 *
 * Frontend: http://localhost:3001
 * Backend:  http://localhost:3000
 */
const API_BASE_URL = (
  runtimeEnv.env?.VITE_API_BASE_URL || "http://localhost:3000"
).replace(/\/$/, "");

const TEACHER_HEALTH_ENDPOINT = "/api/teacher/health";
const TEACHER_DASHBOARD_SUMMARY_ENDPOINT = "/api/teacher/dashboard/summary";
const REQUEST_TIMEOUT_MS = 8000;

function getAuthToken() {
  return (
    localStorage.getItem("auth_token") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token") ||
    sessionStorage.getItem("auth_token") ||
    sessionStorage.getItem("access_token") ||
    sessionStorage.getItem("token")
  );
}

async function request<T>(endpoint: string): Promise<T> {
  const token = getAuthToken();
  const controller = new AbortController();

  const timeoutId = window.setTimeout(() => {
    controller.abort();
  }, REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "GET",
      credentials: "include",
      signal: controller.signal,
      headers: {
        Accept: "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    if (!response.ok) {
      throw new Error(
        `No fue posible consumir ${API_BASE_URL}${endpoint}. Estado HTTP: ${response.status}`
      );
    }

    return response.json() as Promise<T>;
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new Error(
        `Tiempo de espera agotado consumiendo ${API_BASE_URL}${endpoint}. Verifica que el backend esté disponible.`
      );
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

export const teacherApi: TeacherRepository = {
  async getHealth(): Promise<TeacherHealthResponse> {
    const payload = await request<unknown>(TEACHER_HEALTH_ENDPOINT);
    return mapTeacherHealthResponse(payload);
  },

  async getDashboardSummary(): Promise<TeacherDashboardData> {
    const payload = await request<unknown>(TEACHER_DASHBOARD_SUMMARY_ENDPOINT);
    return mapTeacherDashboardSummaryResponse(payload);
  },
};