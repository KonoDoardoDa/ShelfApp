import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          backgroundColor: "var(--bg-app)",
          color: "var(--text-primary)",
          gap: "16px",
        }}
      >
        <div className="spinner" style={{ width: "42px", height: "42px" }} />
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Validando credenciais corporativas...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && allowedRoles.length > 0 && user) {
    const hasRole = allowedRoles.some(
      (r) => r.toLowerCase() === (user.role || "").toLowerCase()
    );
    if (!hasRole) {
      return <Navigate to="/" replace />;
    }
  }

  return <Outlet />;
};
