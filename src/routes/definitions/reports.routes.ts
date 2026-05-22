import { createElement } from "react";
import { RouteObject } from "react-router-dom";
import Reports from "../../presentation/features/reports/Reports";

export const reportsRoutes: RouteObject[] = [
  {
    path: "/reports",
    element: createElement(Reports),
  },
];