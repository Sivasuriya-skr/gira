import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  // Wait for /api/auth/me to finish before deciding
  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--primary-900)",
          gap: "0.75rem",
          color: "var(--text-muted)",
          fontFamily: "var(--font-body)",
          fontSize: "0.95rem",
        }}
      >
        <div className="loading-spinner" />
        Verifying session…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Wrong role → redirect to their own dashboard
  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to={`/${user.role}-dashboard`} replace />;
  }

  return children;
};

export default ProtectedRoute;
