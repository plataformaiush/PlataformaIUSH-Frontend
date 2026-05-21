// Tipos de datos para el módulo de reportes — basados en las respuestas reales del backend

// Curso con su cantidad de inscritos — usado en el reporte de cursos populares
export interface Course {
  curso_id: string;
  curso_titulo: string;
  total_inscritos: string; // Llega como string desde PostgreSQL, usar parseInt() al operar
}

// Período con su cantidad de inscripciones — usado en el reporte de inscripciones por período
export interface EnrollmentByPeriod {
  periodo: string;
  total_inscripciones: string; // Llega como string, usar parseInt() al operar
}

// Módulo con su promedio de intentos — usado en el reporte de intentos por módulo
export interface AttemptsByModule {
  id_modulo: string;
  modulo_titulo: string;
  curso_id: string;
  total_estudiantes: string; // Llega como string, usar parseInt() al operar
  promedio_intentos: string | null; // null si el módulo no tiene intentos registrados
  fecha: string | null; // null si no hay intentos
}

// Curso con su tasa de completitud — usado en el reporte de tasa de aprobación
export interface CompletionRate {
  curso_id: string;
  curso_titulo: string;
  total_inscritos: string; // Llega como string, usar parseInt() al operar
  completados: string; // Llega como string, usar parseInt() al operar
  no_completados: string; // Llega como string, usar parseInt() al operar
  porcentaje_completados: string | null; // null si el curso no tiene inscritos
  fecha: string | null; // null si no hay inscritos
}

// Resumen global de cursos activos e inactivos — objeto único, no array
export interface ActiveVsInactiveCourses {
  total_cursos: string; // Llega como string, usar parseInt() al operar
  activos: string; // Llega como string, usar parseInt() al operar
  inactivos: string; // Llega como string, usar parseInt() al operar
}

// Resumen global de certificados emitidos vs descargados — objeto único, no array
export interface Certificates {
  total_emitidos: string; // Llega como string, usar parseInt() al operar
  total_descargados: string; // Llega como string, usar parseInt() al operar
  porcentaje_descarga: string | null; // null si no hay certificados emitidos
}

// Estructura genérica de respuesta del backend — envuelve todos los datos
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    total?: number;
    filtros_aplicados?: Record<string, unknown>;
  };
}
