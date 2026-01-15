import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";

import LandingPage from "./pages/LandingPage.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Marketplace from "./pages/retailer/marketplace.jsx";
import ProductDetail from "./pages/retailer/ProductDetail.jsx";
import Cart from "./pages/retailer/Cart.jsx";
import PendingApproval from "./pages/PendingApproval.jsx";
import OrderSuccess from "./pages/OrderSuccess.jsx";

import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

import Home from "./pages/dashboard/Home.jsx";
import Categories from "./pages/dashboard/Categories.jsx";
import Units from "./pages/dashboard/Units.jsx";
import Products from "./pages/dashboard/Products.jsx";
import AddProduct from "./pages/dashboard/products/AddProducts.jsx";

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
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/order-success" element={<OrderSuccess />} />

        {/* Protected Dashboard – admin + verified wholesaler */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin", "wholesaler"]}>
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/categories"
          element={
            <ProtectedRoute allowedRoles={["admin", "wholesaler"]}>
              <DashboardLayout>
                <Categories />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/units"
          element={
            <ProtectedRoute allowedRoles={["admin", "wholesaler"]}>
              <DashboardLayout>
                <Units />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute allowedRoles={["admin", "wholesaler"]}>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products/add"
          element={
            <ProtectedRoute allowedRoles={["admin", "wholesaler"]}>
              <DashboardLayout>
                <AddProduct />
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
                <a
                  href="/"
                  className="inline-block px-10 py-5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-700 transition shadow-lg"
                >
                  Back to Home
                </a>
              </div>
            </div>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;