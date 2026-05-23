export interface Course {
  curso_id: string;
  curso_titulo: string;
  total_inscritos: string;
}
export type PopularCourseResponse = Course[];


export interface Certificates {
  total_emitidos: string;
  total_descargados: string;
  porcentaje_descarga: string | null;
}