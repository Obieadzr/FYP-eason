import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

// Pages
import LandingPage from "./pages/public/LandingPage.jsx";
import Login from "./pages/auth/Login.jsx";
import Register from "./pages/auth/Register.jsx";
import Marketplace from "./pages/retailer/Marketplace.jsx";
import ProductDetail from "./pages/retailer/ProductDetail.jsx";
import Cart from "./pages/retailer/Cart.jsx";
import Wishlist from "./pages/retailer/Wishlist.jsx";
import Orders from "./pages/retailer/Orders.jsx";
import PendingApproval from "./pages/auth/PendingApproval.jsx";
import OrderSuccess from "./pages/orders/OrderSuccess.jsx";
import OrderKanban from "./pages/orders/OrderKanban.jsx";
import Profile from "./pages/auth/Profile.jsx";

// Wholesaler/Admin shared
import AddProduct from "./pages/wholesaler/AddProduct.jsx";

// Dashboard
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.jsx";

import Home from "./pages/dashboard/Home.jsx";
import Categories from "./pages/dashboard/Categories.jsx";
import Units from "./pages/dashboard/Units.jsx";
import Products from "./pages/dashboard/Products.jsx";
import AddProductDashboard from "./pages/dashboard/products/AddProducts.jsx"; // renamed to avoid confusion
import VerificationQueue from "./pages/dashboard/VerificationQueue.jsx";

function App() {
  const { checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Generic Protected Pages */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/orders/kanban" element={<ProtectedRoute allowedRoles={["wholesaler", "admin"]}><OrderKanban /></ProtectedRoute>} />

        <Route
          path="/add-product"
          element={
            <ProtectedRoute allowedRoles={["admin", "wholesaler"]}>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/verification"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <VerificationQueue />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/categories"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <Categories />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/units"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <Units />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products/add"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AddProductDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center p-8">
                <h1 className="text-8xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-2xl text-gray-600 mb-8">Page not found</p>
                <button
                  onClick={() => navigate("/")}
                  className="inline-block px-10 py-5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition shadow-lg"
                >
                  Back to Home
                </button>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;