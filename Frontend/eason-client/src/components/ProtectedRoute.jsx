// src/components/ProtectedRoute.jsx
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-50/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="text-center px-6">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold text-gray-900">Verifying session...</h2>
          <p className="text-gray-600 mt-2">Please wait a moment</p>
        </div>
      </div>
    );
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = user.role.trim().toLowerCase();

  // Wholesaler not verified → pending approval
  if (role === "wholesaler" && !user.verified) {
    return <Navigate to="/pending-approval" replace />;
  }

  // Admin-only routes (dashboard, admin panel, etc.)
  if (location.pathname.startsWith("/dashboard") || location.pathname.startsWith("/admin")) {
    if (role !== "admin") {
      // Redirect to appropriate page
      const redirect = role === "retailer" ? "/marketplace" : "/";
      return <Navigate to={redirect} replace />;
    }
  }

  // General role check for other protected routes
  if (allowedRoles.length > 0) {
    const allowed = allowedRoles.map(r => r.toLowerCase().trim());
    if (!allowed.includes(role)) {
      const redirect = role === "retailer" ? "/marketplace" : "/";
      return <Navigate to={redirect} replace />;
    }
  }

  return children;
};

export default ProtectedRoute;