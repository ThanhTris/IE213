import React from "react";
import { Navigate, useLocation } from "react-router-dom";

/**
 * ProtectedRoute component - redirects to login if not authenticated
 * or to a default page if the user doesn't have the required role.
 */
function ProtectedRoute({ children, isAuthenticated, userRole, requiredRole }) {
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to auth page but save the current location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requiredRole && String(userRole || "").toLowerCase() !== String(requiredRole || "").toLowerCase()) {
    // If user is authenticated but doesn't have the right role
    // Redirect to their own portal based on their role
    return <Navigate to={String(userRole || "").toLowerCase() === "admin" ? "/admin" : "/user"} replace />;
  }

  return children;
}

export default ProtectedRoute;
