// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import LandingPage from "./pages/LandingPage.jsx";
import Marketplace from "./pages/retailer/marketplace.jsx";
import ProductDetail from "./pages/retailer/ProductDetail.jsx"; // if you have this
import PendingApproval from "./pages/PendingApproval.jsx";
import Cart from "./pages/retailer/Cart.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import Home from "./pages/dashboard/Home.jsx";
import Categories from "./pages/dashboard/Categories.jsx";
import Units from "./pages/dashboard/Units.jsx";
import Products from "./pages/dashboard/Products.jsx";
import AddProduct from "./pages/dashboard/products/AddProducts.jsx";

import ProtectedRoute from "./components/ProtectedRoute.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Pending Approval */}
        <Route path="/pending-approval" element={<PendingApproval />} />

        {/* Marketplace - Shared by Retailer & Verified Wholesaler */}
        <Route
          path="/marketplace"
          element={
            <ProtectedRoute allowedRoles={["retailer", "wholesaler"]}>
              <Marketplace />
            </ProtectedRoute>
          }
        />
        <Route
          path="/cart"
          element={
            <ProtectedRoute allowedRoles={["retailer", "wholesaler"]}>
              <Cart />
            </ProtectedRoute>
          }
        />
        {/* Optional: Product Detail */}
        <Route
          path="/marketplace/product/:id"
          element={
            <ProtectedRoute allowedRoles={["retailer", "wholesaler"]}>
              <ProductDetail />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard - Only Admin */}
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
                <AddProduct />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
