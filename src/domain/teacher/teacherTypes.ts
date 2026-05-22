export type TeacherView = "dashboard";

export type TeacherCourseStatus =
  | "En creación"
  | "Publicado"
  | "Sin módulos"
  | "Sin contenidos"
  | "Pendiente";

export interface TeacherProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  initials: string;
}

export interface TeacherQuickActions {
  createCourseUrl?: string | null;
  createContentUrl?: string | null;
  coursesUrl?: string | null;
}

export interface TeacherDashboardTotals {
  students: number;
  courses: number;
  modules: number;
  contents: number;
}

export interface TeacherCourseInsight {
  id: string;
  title: string;
  code?: string | null;
  modulesCount: number;
  contentsCount: number;
  enrolledStudents: number;
  completedStudents: number;
  progressPercentage?: number | null;
  status?: TeacherCourseStatus | null;
  detailUrl?: string | null;
}

export interface RecentEnrolledStudent {
  id: string;
  studentId?: string | null;
  studentName: string;
  email?: string | null;
  avatar?: string | null;
  courseId: string;
  courseTitle: string;
  progressPercentage: number;
  enrolledAt: string;
  detailUrl?: string | null;
}

export interface TeacherDashboardData {
  teacher: TeacherProfile;
  quickActions: TeacherQuickActions;
  totals: TeacherDashboardTotals;
  coursesInCreation: TeacherCourseInsight[];
  topCompletedCourses: TeacherCourseInsight[];
  topEnrolledCourses: TeacherCourseInsight[];
  lowEnrolledCourses: TeacherCourseInsight[];
  recentEnrollments: RecentEnrolledStudent[];
}

export interface TeacherHealthResponse {
  status: string;
  module?: string;
  team?: string;
  timestamp?: string;
}