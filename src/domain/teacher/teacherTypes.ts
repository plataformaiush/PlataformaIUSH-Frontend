export type TeacherView = "dashboard" | "courses" | "grades" | "students";

export type StudentStatus = "Activo" | "En riesgo" | "Inactivo";

export interface TeacherProfile {
  name: string;
  role: string;
  email: string;
  initials: string;
}

export interface TeacherStat {
  id: string;
  label: string;
  value: string;
  helper: string;
  trend?: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: "PDF" | "Video" | "Enlace" | "Quiz";
  duration: string;
}

export interface CourseModule {
  id: string;
  title: string;
  description: string;
  published: boolean;
  materials: CourseMaterial[];
}

export interface TeacherCourse {
  id: string;
  title: string;
  code: string;
  period: string;
  students: number;
  progress: number;
  publishedModules: number;
  totalModules: number;
  colorFrom: string;
  colorTo: string;
  description: string;
  nextClass: string;
  modules: CourseModule[];
}

export interface TeacherStudent {
  id: string;
  name: string;
  email: string;
  course: string;
  status: StudentStatus;
  average: number;
  avatar: string;
}

export interface GradeAssignment {
  key: string;
  label: string;
  percentage: number;
}

export interface GradeRow {
  id: string;
  student: string;
  email: string;
  courseId: string;
  assignments: Record<string, number | null>;
}