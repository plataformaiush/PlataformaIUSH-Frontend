import { Navigate, type RouteObject } from "react-router-dom";
import TeacherDashboard from "../../presentation/features/teacher/TeacherDashboard";

export const teacherRoutes: RouteObject[] = [
  {
    path: "/teacher",
    element: <Navigate to="/teacher/dashboard" replace />,
  },
  {
    path: "/teacher/dashboard",
    element: <TeacherDashboard />,
  },
];