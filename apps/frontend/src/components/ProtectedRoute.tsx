import { useIsAuthenticated } from "@/api/auth/queries";
import type { JSX } from "react";
import { Navigate, Outlet } from "react-router-dom";

const ProtectedRoute = (): JSX.Element => {
  const { isAuthenticated } = useIsAuthenticated();

  return isAuthenticated ? <Outlet /> : <Navigate replace to="/login" />;
};

export default ProtectedRoute;
