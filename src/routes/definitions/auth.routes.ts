import { createElement } from "react";
import { RouteObject } from "react-router-dom";
import LoginPage from "../../presentation/features/student/auth/pages/LoginPage";

export const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: createElement(LoginPage),
  },
  {
    path: "/login",
    element: createElement(LoginPage),
  },
];