import { axiosInstance } from "../service/reportService";
import { ApiResponse } from "../types/ApiResponsive";
import { CompletionRate } from "../types/ProgressChart";

/** Obtiene el porcentaje de estudiantes que completaron cada curso */
export const CourseCompletionRate = async (
  curso_id?: string,
  fecha_inicio?: string,
  fecha_fin?: string,
): Promise<ApiResponse<CompletionRate[]>> => {
  const params = { curso_id, fecha_inicio, fecha_fin };
  const response = await axiosInstance.get(
    "/api/reportes/tasa-aprobacion",
    { params }
  );
  return response.data;
};