// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Not logged in → redirect to login
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Role restriction: only allow if role matches
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on current user role
    if (user.role === "admin") {
      return <Navigate to="/dashboard" replace />;
    }
    // Retailer or wholesaler → marketplace
    return <Navigate to="/marketplace" replace />;
  }

  // Wholesaler not verified → pending page
  if (user.role === "wholesaler" && user.verified === false) {
    return <Navigate to="/pending-approval" replace />;
  }

  // All checks passed → show the page
  return children;
};

export default ProtectedRoute;