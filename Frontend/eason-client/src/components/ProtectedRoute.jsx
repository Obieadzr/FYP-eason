import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying session...</p>
        </div>
      </div>
    );
  }

  if (!user || !user.role) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const role = user.role.trim().toLowerCase();

  if (role === "wholesaler" && user.verified === false) {
    return <Navigate to="/pending-approval" replace />;
  }

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