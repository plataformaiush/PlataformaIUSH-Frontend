import { axiosInstance } from "../service/reportService";
import { ApiResponse } from "../types/ApiResponsive";
import { AttemptsByModule, ModuleAttemptParams } from "../types/HorizontalBarChart";

// Obtiene el promedio de intentos que los estudiantes necesitan para aprobar cada módulo 
export const ModuleAttempts = async (
  curso_id?: string,
  fecha_inicio?: string,
  fecha_fin?: string,
): Promise<ApiResponse<AttemptsByModule[]>> => {
  const params: ModuleAttemptParams = { curso_id, fecha_inicio, fecha_fin };
  const response = await axiosInstance.get(
    "/api/reportes/intentos-por-modulo",
    { params }
  );
  return response.data;
};