import { axiosInstance } from "../service/reportService";
import { ApiResponse } from "../types/ApiResponsive";
import { ActiveVsInactiveCourses } from "../types/DonutChart";

// Obtiene el resumen global de cursos activos e inactivos
export const ActiveInactiveCourses = async (): Promise<ApiResponse<ActiveVsInactiveCourses>> => {
  const response = await axiosInstance.get(
    "/api/reportes/cursos-activos-vs-inactivos"
  );
  return response.data;
};