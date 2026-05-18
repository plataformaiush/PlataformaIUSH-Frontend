import { createElement } from "react";
import { RouteObject } from "react-router-dom";
import Reports from "../../presentation/features/reports/Reports";
import RequireRole from "../guards/RequireRole";

export const reportsRoutes: RouteObject[] = [
  {
    path: "/:role/reportes",
    element: createElement(
      RequireRole,
      { allowedRoles: ["Admin", "SuperAdmin"] },
      createElement(Reports)
    ),
  },
];