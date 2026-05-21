import { axiosInstance } from "../service/reportService";
import { ApiResponse, ActiveVsInactiveCourses } from "../types/reports.types";

// Obtiene el resumen global de cursos activos e inactivos
export const getActiveVsInactiveCourses = async (): Promise<
  ApiResponse<ActiveVsInactiveCourses>
> => {
  const response = await axiosInstance.get(
    "/api/reportes/cursos-activos-vs-inactivos",
  );
  return response.data;
};
