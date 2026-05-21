import { axiosInstance } from "../service/reportService";
import { ApiResponse, Certificates } from "../types/reports.types";

// Obtiene el resumen global de certificados emitidos vs descargados, no hay params
export const getCertificates = async (): Promise<ApiResponse<Certificates>> => {
  const response = await axiosInstance.get("/api/reportes/certificados");
  return response.data;
};
