export interface StudentProgress {
  courseId: string
  completedContents: string[]
  lastAccessedAt: string
  percentageComplete: number
}

export interface StudentInfo {
  id: string
  name: string
  avatar: string
  email: string
}

export interface StudentStats {
  activeCourses: number
  completedCourses: number
  totalCourses: number
  avgProgress: number
  streak: number
}

export interface EnrolledCourse {
  id: string
  title: string
  thumbnail: string
  progress: number
  lastAccessedAt: string
}

export interface StudentDashboardData {
  student: StudentInfo
  enrolledCourses: EnrolledCourse[]
  stats: StudentStats
}
