import { axiosInstance } from "../service/reportService";
import { ApiResponse, CompletionRate } from "../types/reports.types";

// Obtiene el porcentaje de estudiantes que completaron cada curso
export const getCompletionRate = async (
  curso_id?: string,
  fecha_inicio?: string,
  fecha_fin?: string,
): Promise<ApiResponse<CompletionRate[]>> => {
  const params = { curso_id, fecha_inicio, fecha_fin };
  const response = await axiosInstance.get("/api/reportes/tasa-aprobacion", {
    params,
  });
  return response.data;
};
