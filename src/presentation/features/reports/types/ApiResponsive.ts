// Estructura genérica que envuelve todas las respuestas del backend.Todos los endpoints retornan sus datos dentro de esta interfaz
export interface ApiResponse<T> {
  success: boolean; // Indica si la petición fue exitosa
  data: T; // Datos retornados por el endpoint
  meta?: {
    total?: number; // Total de registros
    filtros_aplicados?: Record<string, unknown>; // Filtros de la consulta
  };
}