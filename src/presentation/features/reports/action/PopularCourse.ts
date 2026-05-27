import { axiosInstance } from "../service/reportService";
import { ApiResponse } from "../types/ApiResponsive";
import { Course } from "../types/BarChart";

// Obtiene la lista de cursos ordenados de mayor a menor número de inscritos 
export const PopularCourses = async (
  curso_id?: string,
): Promise<ApiResponse<Course[]>> => {
  const params = curso_id ? { curso_id } : {};
  const response = await axiosInstance.get(
    "/api/reportes/cursos-populares",
    { params }
  );
  return response.data;
};