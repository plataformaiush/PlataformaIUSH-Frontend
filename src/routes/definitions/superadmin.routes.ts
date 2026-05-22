import { createElement } from "react";
import { RouteObject } from "react-router-dom";
import { SuperAdminPage } from "../../presentation/features/institutions/SuperAdminPage";
import RequireRole from "../guards/RequireRole";

export const superAdminRoutes: RouteObject[] = [
  {
    path: "/super-admin",
    element: createElement(
      RequireRole,
      { allowedRoles: ["SuperAdmin", "Admin"], fallbackPath: "/login" },
      createElement(SuperAdminPage)
    ),
  },
  {
    path: "/super-admin/dashboard",
    element: createElement(
      RequireRole,
      { allowedRoles: ["SuperAdmin", "Admin"], fallbackPath: "/login" },
      createElement(SuperAdminPage)
    ),
  },
  {
    path: "/super-admin/usuarios",
    element: createElement(
      RequireRole,
      { allowedRoles: ["SuperAdmin", "Admin"], fallbackPath: "/login" },
      createElement(SuperAdminPage)
    ),
  },
  {
    path: "/super-admin/cursos",
    element: createElement(
      RequireRole,
      { allowedRoles: ["SuperAdmin", "Admin"], fallbackPath: "/login" },
      createElement(SuperAdminPage)
    ),
  },
  {
    path: "/super-admin/resumen",
    element: createElement(
      RequireRole,
      { allowedRoles: ["SuperAdmin", "Admin"], fallbackPath: "/login" },
      createElement(SuperAdminPage)
    ),
  },
  {
    path: "/super-admin/personalizacion",
    element: createElement(
      RequireRole,
      { allowedRoles: ["SuperAdmin", "Admin"], fallbackPath: "/login" },
      createElement(SuperAdminPage)
    ),
  },
];
