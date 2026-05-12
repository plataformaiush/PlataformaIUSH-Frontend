import { useRoutes } from "react-router-dom";
import { authRoutes } from "./definitions/auth.routes";

export const AppRouter = () => {
  const routes = useRoutes(authRoutes);
  return routes;
};