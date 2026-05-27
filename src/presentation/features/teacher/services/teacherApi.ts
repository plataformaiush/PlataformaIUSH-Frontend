import {
  composeTeacherDashboardData,
  mapTeacherHealthResponse,
} from "../../../../domain/teacher/teacherMappers";
import { TeacherRepository } from "../../../../domain/teacher/teacherRepository";
import {
  TeacherDashboardData,
  TeacherHealthResponse,
} from "../../../../domain/teacher/teacherTypes";
import { tokenManager } from "../../../services/tokenManager";

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
const TEACHER_COURSES_IN_PROGRESS_ENDPOINT =
  "/api/teacher/dashboard/courses/in-progress";
const TEACHER_STUDENTS_TOTAL_ENDPOINT =
  "/api/teacher/dashboard/students/total";
const TEACHER_TOP_ENROLLED_ENDPOINT =
  "/api/teacher/dashboard/courses/top-enrolled";
const TEACHER_LOWEST_ENROLLED_ENDPOINT =
  "/api/teacher/dashboard/courses/lowest-enrolled";
const TEACHER_TOP_COMPLETED_ENDPOINT =
  "/api/teacher/dashboard/courses/top-completed";
const TEACHER_RECENT_STUDENTS_ENDPOINT =
  "/api/teacher/dashboard/students/recent";

const REQUEST_TIMEOUT_MS = 8000;

function getAuthToken() {
  // El backend devuelve la key `token` y `tokenManager` la persiste con ese mismo nombre.
  return tokenManager.getToken();
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
      mode: "cors",
      cache: "no-store",
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

async function safeRequest<T>(endpoint: string): Promise<T | null> {
  try {
    return await request<T>(endpoint);
  } catch {
    return null;
  }
}

export const teacherApi: TeacherRepository = {
  async getHealth(): Promise<TeacherHealthResponse> {
    const payload = await request<unknown>(TEACHER_HEALTH_ENDPOINT);
    return mapTeacherHealthResponse(payload);
  },

  async getDashboardSummary(): Promise<TeacherDashboardData> {
    const summary = await request<unknown>(TEACHER_DASHBOARD_SUMMARY_ENDPOINT);

    const [
      coursesInProgress,
      studentsTotal,
      topEnrolled,
      lowestEnrolled,
      topCompleted,
      recentStudents,
    ] = await Promise.all([
      safeRequest<unknown>(TEACHER_COURSES_IN_PROGRESS_ENDPOINT),
      safeRequest<unknown>(TEACHER_STUDENTS_TOTAL_ENDPOINT),
      safeRequest<unknown>(TEACHER_TOP_ENROLLED_ENDPOINT),
      safeRequest<unknown>(TEACHER_LOWEST_ENROLLED_ENDPOINT),
      safeRequest<unknown>(TEACHER_TOP_COMPLETED_ENDPOINT),
      safeRequest<unknown>(TEACHER_RECENT_STUDENTS_ENDPOINT),
    ]);

    return composeTeacherDashboardData({
      summary,
      coursesInProgress,
      studentsTotal,
      topEnrolled,
      lowestEnrolled,
      topCompleted,
      recentStudents,
    });
  },
};