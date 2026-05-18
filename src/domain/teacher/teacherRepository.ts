import {
  TeacherDashboardData,
  TeacherHealthResponse,
} from "./teacherTypes";

export interface TeacherRepository {
  getHealth: () => Promise<TeacherHealthResponse>;
  getDashboardSummary: () => Promise<TeacherDashboardData>;
}