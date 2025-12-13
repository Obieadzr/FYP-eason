// src/components/DashboardLayout.jsx
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { LayoutDashboard, Package, Tags, Ruler, Search, Bell, Menu, LogOut, ChevronLeft } from "lucide-react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/categories", label: "Categories", icon: Tags },
  { to: "/dashboard/units", label: "Units", icon: Ruler },
];

const FiberBg = () => (
  <div className="fixed inset-0 -z-10 opacity-40 pointer-events-none">
    <Canvas camera={{ position: [0, 0, 10], fov: 80 }}>
      <ambientLight intensity={1} />
      <Float speed={3.5} rotationIntensity={0.7} floatIntensity={1.6}>
        <Sphere args={[1, 128, 128]} scale={5}>
          <MeshDistortMaterial
            color="#10b981"
            distort={0.38}
            speed={1.8}
            roughness={0}
            metalness={1}
            transparent
            opacity={0.18}
          />
        </Sphere>
      </Float>
    </Canvas>
  </div>
);

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isActive = (path) => location.pathname.startsWith(path) || (path === "/dashboard" && location.pathname === "/dashboard");

  return (
    <>
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap" rel="stylesheet" />
      <FiberBg />

      <div className="h-screen flex bg-gradient-to-br from-emerald-50 via-white to-teal-50 font-['Satoshi'] overflow-hidden">
        
        {/* Sidebar — Clean White Glass */}
        <aside className={`bg-white/90 backdrop-blur-3xl border-r border-white/50 shadow-2xl flex flex-col transition-all duration-500 ${sidebarCollapsed ? "w-20" : "w-80"}`}>
          <div className="h-20 px-8 flex items-center justify-between border-b border-gray-100">
            {!sidebarCollapsed && (
                <motion.h1
                        onClick={() => navigate("/")}
                        className="text-2xl font-bold text-gray-900 cursor-pointer hover:opacity-80 transition"
                        whileHover={{ scale: 1.05 }}
                      >
                        eAson<span className="text-emerald-600">.</span>
                      </motion.h1>
            )}
            <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)} className="p-3 hover:bg-gray-100 rounded-2xl transition">
              {sidebarCollapsed ? <Menu className="w-5 h-5 text-gray-600" /> : <ChevronLeft className="w-5 h-5 text-gray-600" />}
            </button>
          </div>

          <nav className="flex-1 p-6">
            <div className="space-y-3">
              {NAV_ITEMS.map((item) => {
                const active = isActive(item.to);
                return (
                  <NavLink key={item.to} to={item.to} end>
                    <motion.div
                      whileHover={{ x: 6 }}
                      className={`flex items-center h-16 rounded-2xl transition-all ${active ? "bg-emerald-600 text-white shadow-lg" : "hover:bg-gray-100 text-gray-700"}`}
                    >
                      <div className="flex items-center gap-5 px-6 w-full">
                        <item.icon className="w-6 h-6" />
                        {!sidebarCollapsed && <span className="font-medium text-base">{item.label}</span>}
                      </div>
                    </motion.div>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="p-6 border-t border-gray-100">
            <div className={`flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white ${sidebarCollapsed && "justify-center"}`}>
              <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-2xl flex items-center justify-center font-bold text-xl">
                {user?.fullName?.[0] || "A"}
              </div>
              {!sidebarCollapsed && (
                <div>
                  <p className="font-semibold">{user?.fullName || "Admin"}</p>
                  <p className="text-xs opacity-90">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <div className="flex-1 flex flex-col">
          <header className="h-20 bg-white/80 backdrop-blur-3xl border-b border-gray-100 flex items-center justify-between px-8">
            <div className="flex items-center gap-6 flex-1">
              <button className="lg:hidden p-3 hover:bg-gray-100 rounded-2xl"><Menu className="w-6 h-6" /></button>
              <div className="relative max-w-md w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search anything..."
                  className="w-full pl-14 pr-6 py-4 bg-gray-100/70 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 transition placeholder:text-gray-500"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-3 hover:bg-gray-100 rounded-2xl">
                <Bell className="w-6 h-6 text-gray-600" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
              </button>
              <button onClick={() => { logout(); navigate("/login"); }} className="p-3 hover:bg-gray-100 rounded-2xl text-gray-600">
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}