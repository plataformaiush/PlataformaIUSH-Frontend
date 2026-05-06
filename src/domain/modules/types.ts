export type ModuleStatus = 'active' | 'inactive'

export interface Module {
  id: string               // Identificador único del módulo
  courseId: string         // ID del curso al que pertenece
  title: string            // Nombre del módulo
  description: string      // Descripción breve del módulo
  order: number            // Orden del módulo dentro del curso
  status: ModuleStatus     // Estado del módulo en la plataforma
  contentIds: string[]     // IDs de los contenidos que tiene el módulo
}