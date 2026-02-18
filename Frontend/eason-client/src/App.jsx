import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import { useNavigate } from "react-router-dom";
// Public pages
import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Marketplace from "./pages/retailer/marketplace.jsx";
import ProductDetail from "./pages/retailer/ProductDetail.jsx";
import Cart from "./pages/retailer/Cart.jsx";
import Orders from "./pages/retailer/Orders.jsx";
import PendingApproval from "./pages/PendingApproval.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";

// Wholesaler: Add product from marketplace
import AddProduct from "./pages/wholesaler/AddProduct.jsx";

// Admin Dashboard (admin only)
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/dashboard/Home.jsx";
import Categories from "./pages/dashboard/Categories.jsx";
import Units from "./pages/dashboard/Units.jsx";
import Products from "./pages/dashboard/Products.jsx";
import AddProductDashboard from "./pages/dashboard/products/AddProducts.jsx"; // renamed to avoid confusion

function App() {
  const { checkAuth } = useAuthStore();
  // const navigate = useNavigate();
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Wholesaler-only: Add product from marketplace */}
        <Route
          path="/add-product"
          element={
            <ProtectedRoute allowedRoles={["wholesaler"]}>
              <AddProduct />
            </ProtectedRoute>
          }
        />

        {/* Admin-only Dashboard Routes */}
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

        {/* 404 - Catch-all */}
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