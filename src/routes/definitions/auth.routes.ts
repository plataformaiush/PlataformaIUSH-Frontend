import { createElement } from "react";
import { RouteObject } from "react-router-dom";
import LoginPage from "../../presentation/features/student/auth/pages/LoginPage";
import RolePage from "../../presentation/features/student/auth/pages/rolePage";

export const authRoutes: RouteObject[] = [
  {
    path: "/",
    element: createElement(LoginPage),
  },
  {
    path: "/role",
    element: createElement(RolePage),
  },
];