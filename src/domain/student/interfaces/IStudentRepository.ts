import type { StudentDashboardData, StudentProgress } from '../../../../../front-estudiantes/src/domain/student/types'

export interface IStudentRepository {
  getDashboard(studentId: string): Promise<StudentDashboardData>
  getProgress(studentId: string): Promise<StudentProgress[]>
  markContentComplete(courseId: string, contentId: string): Promise<void>
}
