// src/components/DashboardLayout.jsx
import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LayoutDashboard, Package, Tags, Ruler, Search, Bell, Menu, LogOut, ChevronLeft, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/verification", label: "KYC Approvals", icon: ShieldCheck },
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
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      <link
        href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700,900&display=swap"
        rel="stylesheet"
      />
      <FiberBg />

      <div className="h-screen flex bg-white tracking-widest overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Sidebar */}
        <aside
          className={`bg-white border-r border-gray-200 flex flex-col transition-all duration-500 ${
            sidebarCollapsed ? "w-20" : "w-80"
          }`}
        >
          <div className="h-20 px-8 flex items-center justify-between border-b border-gray-100">
            {!sidebarCollapsed && (
              <motion.h1
                onClick={() => navigate("/")}
                className="text-xl font-bold tracking-widest uppercase text-black cursor-pointer hover:opacity-70 transition-opacity"
                whileHover={{ scale: 1.02 }}
              >
                eAson<span className="text-black">.</span>
              </motion.h1>
            )}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-3 hover:bg-gray-100 transition-colors"
            >
              {sidebarCollapsed ? (
                <Menu className="w-5 h-5 text-black" />
              ) : (
                <ChevronLeft className="w-5 h-5 text-black" />
              )}
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
                      className={`flex items-center h-16 transition-colors duration-300 ${
                        active ? "bg-black text-white font-bold" : "hover:bg-[#f9f9f9] text-gray-500 hover:text-black font-bold"
                      }`}
                    >
                      <div className="flex items-center gap-5 px-6 w-full uppercase text-xs tracking-widest">
                        <item.icon className="w-5 h-5" />
                        {!sidebarCollapsed && <span>{item.label}</span>}
                      </div>
                    </motion.div>
                  </NavLink>
                );
              })}
            </div>
          </nav>

          <div className="p-6 border-t border-gray-200">
            <div
              className={`flex items-center gap-4 p-4 border border-gray-200 hover:border-black transition-colors bg-white text-black ${
                sidebarCollapsed && "justify-center"
              }`}
            >
              <div className="w-12 h-12 bg-black text-white flex items-center justify-center font-bold text-xl uppercase">
                {user?.fullName?.[0] || "A"}
              </div>
              {!sidebarCollapsed && (
                <div>
                  <p className="font-bold tracking-tight text-sm uppercase">{user?.fullName || "Admin"}</p>
                  <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">{user?.email}</p>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Main Area */}
        <div className="flex-1 flex flex-col bg-[#f9f9f9]">
          <header className="h-20 bg-white border-b border-gray-200 flex items-center justify-between px-8">
            <div className="flex items-center gap-6 flex-1">
              <button className="lg:hidden p-3 hover:bg-gray-100 transition-colors">
                <Menu className="w-6 h-6 text-black" />
              </button>
              <div className="relative max-w-md w-full">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                <input
                  type="text"
                  placeholder="SEARCH ANYTHING..."
                  className="w-full pl-14 pr-6 py-4 bg-[#f9f9f9] border border-gray-200 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors rounded-none placeholder:uppercase placeholder:tracking-widest placeholder:text-gray-400 text-sm font-bold tracking-widest text-black"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button className="relative p-3 hover:bg-gray-100 transition-colors">
                <Bell className="w-6 h-6 text-black" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-black rounded-full border-2 border-white"></span>
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/", { replace: true });
                }}
                className="p-3 hover:bg-gray-100 text-black transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="p-8">{children}</div>
          </main>
        </div>
      </div>
    </>
  );
}