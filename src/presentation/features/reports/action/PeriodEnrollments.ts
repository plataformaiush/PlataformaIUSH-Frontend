import { axiosInstance } from "../service/reportService";
import { ApiResponse } from "../types/ApiResponsive";
import { EnrollmentByPeriod } from "../types/LineChart";

// Obtiene las inscripciones agrupadas por período
export const PeriodEnrollments = async (
  agrupacion?: string,
  fecha_inicio?: string,
  fecha_fin?: string,
  curso_id?: string,
): Promise<ApiResponse<EnrollmentByPeriod[]>> => {
  const params = { agrupacion, fecha_inicio, fecha_fin, curso_id };
  const response = await axiosInstance.get(
    "/api/reportes/inscripciones-por-periodo",
    { params }
  );
  return response.data;
};