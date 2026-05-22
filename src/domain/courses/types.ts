export type CourseLevel = 'beginner' | 'intermediate' | 'advanced'
export type CourseStatus = 'active' | 'inactive'

export interface Course {
  id: string
  title: string
  description: string
  instructor: string
  level: CourseLevel
  status: CourseStatus
  moduleIds: string[]
  studentCount: number
}
