export interface AttemptsByModule {
  id_modulo: string;
  modulo_titulo: string;
  curso_id: string;
  total_estudiantes: string;
  promedio_intentos: string | null;
  fecha: string | null;
}
export type ModuleAttemptResponse = AttemptsByModule[];

export interface ModuleAttemptParams {
  curso_id?: string;
  fecha_inicio?: string;
  fecha_fin?: string;
}