export interface CompletionRate {
  curso_id: string;
  curso_titulo: string;
  total_inscritos: string;
  completados: string;
  no_completados: string;
  porcentaje_completados: string | null;
  fecha: string | null;
}
export type CourseCompletionRateResponse = CompletionRate[];

export interface CourseCompletionRateParams {
  curso_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}