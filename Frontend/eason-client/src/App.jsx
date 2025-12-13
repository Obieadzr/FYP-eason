// src/App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import DashboardLayout from "./components/DashboardLayout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AddProduct from "./pages/dashboard/products/AddProducts.jsx";  // Fixed path (singular)
import LandingPage from "./pages/LandingPage.jsx"
import Marketplace from "./pages/retailer/marketplace.jsx";
import Home from "./pages/dashboard/Home.jsx";
import Categories from "./pages/dashboard/Categories.jsx";
import Units from "./pages/dashboard/Units.jsx";
import Products from "./pages/dashboard/Products.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
  path="/marketplace" 
  element={
    <ProtectedRoute>
      <Marketplace />
    </ProtectedRoute>
  } 
/>
        {/* Protected Dashboard Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Home />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/categories"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Categories />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/units"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Units />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/products"
          element={
            <ProtectedRoute>
              <DashboardLayout>
                <Products />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />

        {/* ADD PRODUCT ROUTE — ADDED HERE */}
        <Route
          path="/dashboard/products/add"
          element={
            <ProtectedRoute>
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