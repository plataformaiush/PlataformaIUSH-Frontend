import { Navigate, type RouteObject } from "react-router-dom";
import TeacherDashboard from "../../presentation/features/teacher/TeacherDashboard";

export const teacherRoutes: RouteObject[] = [
  {
    path: "teacher",
    children: [
      {
        index: true,
        element: <Navigate to="dashboard" replace />,
      },
      {
        path: "dashboard",
        element: <TeacherDashboard />,
      },
    ],
  },
];