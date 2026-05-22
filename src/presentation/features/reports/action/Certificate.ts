import { axiosInstance } from "../service/reportService";
import { ApiResponse } from "../types/ApiResponsive";
import { Certificates } from "../types/BarChart";

/** Obtiene el resumen global de certificados emitidos vs descargados */
export const Certificate = async (): Promise<ApiResponse<Certificates>> => {
  const response = await axiosInstance.get("/api/reportes/certificados");
  return response.data;
};