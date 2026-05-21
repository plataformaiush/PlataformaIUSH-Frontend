import { axiosInstance } from "../service/reportService";
import { ApiResponse, Course } from "../types/reports.types";

// Obtiene la lista de cursos ordenados de mayor a menor número de inscritos
export const getCursosPopulares = async (
  curso_id?: string,
): Promise<ApiResponse<Course[]>> => {
  const params = curso_id ? { curso_id } : {};
  const response = await axiosInstance.get("/api/reportes/cursos-populares", {
    params,
  });
  return response.data;
};
