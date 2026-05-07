import { BrowserRouter, Routes, Route, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./store/authStore";
import ChatDrawer from "./components/chat/ChatDrawer.jsx";
import { useChat } from "./store/useChat.js";

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
import PaymentSuccess from "./pages/retailer/PaymentSuccess.jsx";
import OrderKanban from "./pages/orders/OrderKanban.jsx";
import Profile from "./pages/auth/Profile.jsx";
import Settings from "./pages/auth/Settings.jsx";
import Messages from "./pages/chat/Messages.jsx";

// New Public Static Pages
import HowItWorks from "./pages/public/HowItWorks.jsx";
import SellOnEason from "./pages/public/SellOnEason.jsx";
import Pricing from "./pages/public/Pricing.jsx";
import AboutUs from "./pages/public/AboutUs.jsx";
import Contact from "./pages/public/Contact.jsx";
import HelpCenter from "./pages/public/HelpCenter.jsx";
import Blog from "./pages/public/Blog.jsx";
import Careers from "./pages/public/Careers.jsx";
import Privacy from "./pages/public/Privacy.jsx";
import Terms from "./pages/public/Terms.jsx";
import Press from "./pages/public/Press.jsx";
import Sitemap from "./pages/public/Sitemap.jsx";
import WholesalerStorefront from "./pages/public/WholesalerStorefront.jsx";

// Wholesaler/Admin shared
import AddProduct from "./pages/wholesaler/AddProduct.jsx";

// Dashboard
import DashboardLayout from "./components/layout/DashboardLayout.jsx";
import ProtectedRoute from "./components/routes/ProtectedRoute.jsx";

import Home from "./pages/dashboard/Home.jsx";
import Categories from "./pages/dashboard/Categories.jsx";
import Units from "./pages/dashboard/Units.jsx";
import Products from "./pages/dashboard/Products.jsx";
import AddProductDashboard from "./pages/dashboard/products/AddProducts.jsx";
import VerificationQueue from "./pages/dashboard/VerificationQueue.jsx";
import Users from "./pages/dashboard/Users.jsx";
import Logistics from "./pages/dashboard/Logistics.jsx";

const NotFound = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] text-white overflow-hidden relative">
      {/* Noise texture overlay */}
      <div 
        className="pointer-events-none absolute inset-0 z-0 opacity-20" 
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }}
      />
      {/* Glow */}
      <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#10b981] opacity-[0.03] rounded-full blur-3xl z-0" />

      <div className="relative z-10 text-center max-w-lg px-6" style={{ fontFamily: "DM Sans, sans-serif" }}>
        <h1 className="text-[120px] font-bold leading-none tracking-tighter text-white mb-2">404</h1>
        <p className="text-xl text-white/50 mb-10 tracking-tight">This page has been discontinued or moved.</p>
        
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-3 mx-auto px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-sm font-medium text-white transition-all duration-300 backdrop-blur-md"
        >
          Return to Hub
        </button>
      </div>
    </div>
  );
};

function App() {
  const { checkAuth, isAuthenticated } = useAuthStore();
  const { initSocket, disconnectSocket, fetchConversations } = useChat();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      initSocket();
      fetchConversations();
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated, initSocket, disconnectSocket, fetchConversations]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/sell" element={<SellOnEason />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/press" element={<Press />} />
        <Route path="/sitemap" element={<Sitemap />} />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/marketplace/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/pending-approval" element={<PendingApproval />} />
        <Route path="/order-success" element={<OrderSuccess />} />
        <Route path="/payment/success" element={<PaymentSuccess />} />
        <Route path="/supplier/:id" element={<WholesalerStorefront />} />

        {/* Generic Protected Pages */}
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
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
        <Route
          path="/dashboard/products/edit/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <AddProductDashboard />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <Users />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/logistics"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout>
                <Logistics />
              </DashboardLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route
          path="*"
          element={<NotFound />}
        />
      </Routes>
      <ChatDrawer />
    </BrowserRouter>
  );
}

export default App;