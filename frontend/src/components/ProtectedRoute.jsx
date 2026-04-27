import React from "react";
import { Navigate } from "react-router-dom";

/**
 * ProtectedRoute component - Guards routes based on authentication and roles.
 * 
 * @param {boolean} isAuthenticated - Whether the user is logged in
 * @param {string} userRole - 'admin', 'user', or undefined
 * @param {string} requiredRole - (Optional) 'admin' if only admins can access
 * @param {React.ReactNode} children - Component to render if authorized
 */
const ProtectedRoute = ({ 
  isAuthenticated, 
  userRole, 
  requiredRole, 
  children 
}) => {
  // 1. If not logged in, redirect to auth page
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // 2. If a specific role is required (e.g., 'admin') but user doesn't have it
  if (requiredRole && userRole !== requiredRole) {
    // Redirect to home if they don't have the required permission
    return <Navigate to="/" replace />;
  }

  // 3. Authorized - render the content
  return children;
};

export default ProtectedRoute;
