import { axiosInstance } from "../service/reportService";
import { ApiResponse, EnrollmentByPeriod } from "../types/reports.types";

// Obtiene las inscripciones agrupadas por período (mensual, trimestral, semestral, anual o rango custom)
export const getEnrollmentsByPeriod = async (
  agrupacion?: string,
  fecha_inicio?: string,
  fecha_fin?: string,
  curso_id?: string,
): Promise<ApiResponse<EnrollmentByPeriod[]>> => {
  const params = { agrupacion, fecha_inicio, fecha_fin, curso_id };
  const response = await axiosInstance.get(
    "/api/reportes/inscripciones-por-periodo",
    { params },
  );
  return response.data;
};
