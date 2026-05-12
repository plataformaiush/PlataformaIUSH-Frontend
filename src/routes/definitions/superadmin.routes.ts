import { createElement } from "react";
import { RouteObject } from "react-router-dom";
import { SuperAdminPage } from "../../presentation/features/institutions/SuperAdminPage";

export const superAdminRoutes: RouteObject[] = [
  {
    path: "/super-admin",
    element: createElement(SuperAdminPage),
  },
];
