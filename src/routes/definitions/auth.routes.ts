import { createElement } from "react";
import { RouteObject } from "react-router-dom";
import LoginPage from "../../presentation/features/student/auth/pages/LoginPage";
import { StudentDashboard } from "../../presentation/features/student/Dashboard";
import UserManagementPage from "../../presentation/features/student/auth/pages/UserManagementPage";

export const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: createElement(LoginPage),
  },
  {
    path: "/login",
    element: createElement(LoginPage),
  },
  {
    path: "/dashboard",
    element: createElement(StudentDashboard),
  },
  {
    path: "/users",
    element: createElement(UserManagementPage),
  },
];