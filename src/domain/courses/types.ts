export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatus = 'active' | 'inactive'

export interface Course {
  id: string
  title: string
  description: string
  instructor?: string  // Opcional - backend no lo devuelve actualmente
  level?: CourseLevel  // Opcional - backend no lo devuelve actualmente
  status: CourseStatus
  moduleIds: string[]
  studentCount?: number  // Opcional - backend no lo devuelve actualmente
  imageId?: string  // ID del documento del equipo 2 (referencia a la imagen)
}
