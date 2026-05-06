export type CourseStatus = 'active' | 'inactive'

export interface Course {
  id: string                   // Identificador único del curso
  title: string                // Nombre del curso
  description: string          // Descripción breve del curso
  instructor: string           // Nombre del instructor
  level: 'beginner' | 'intermediate' | 'advanced' // Nivel del curso
  status: CourseStatus         // Estado del curso en la plataforma
  moduleIds: string[]          // IDs de los módulos que pertenecen al curso
  studentCount: number         // Cantidad de estudiantes inscritos
}