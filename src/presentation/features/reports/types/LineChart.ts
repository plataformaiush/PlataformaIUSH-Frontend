export interface EnrollmentByPeriod {
  periodo: string;
  /** Llega como string → usar parseInt() */
  total_inscripciones: string;
}
export type PeriodEnrollmentResponse = EnrollmentByPeriod[];


export type Grouping = 'mensual' | 'trimestral' | 'semestral' | 'anual' | 'custom';

export interface PeriodEnrollmentParams {
  agrupacion?: Grouping;
  fecha_inicio?: string;
  fecha_fin?: string;
  curso_id?: string;
}