import { createElement } from "react";
import { RouteObject } from "react-router-dom";
import { SuperAdminPage } from "../../presentation/features/institutions/SuperAdminPage";

export const superAdminRoutes: RouteObject[] = [
  {
    path: "/super-admin",
    element: createElement(SuperAdminPage),
  },
  {
    path: "/super-admin/dashboard",
    element: createElement(SuperAdminPage),
  },
  {
    path: "/super-admin/usuarios",
    element: createElement(SuperAdminPage),
  },
  {
    path: "/super-admin/cursos",
    element: createElement(SuperAdminPage),
  },
  {
    path: "/super-admin/resumen",
    element: createElement(SuperAdminPage),
  },
  {
    path: "/super-admin/personalizacion",
    element: createElement(SuperAdminPage),
  },
];
