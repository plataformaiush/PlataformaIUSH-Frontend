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
}
