import { useState, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { LayoutDashboard, Package, Tags, Ruler, Search, Bell, Menu, LogOut, ChevronLeft, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dashboard/products", label: "Products", icon: Package },
  { to: "/dashboard/verification", label: "KYC Approvals", icon: ShieldCheck },
  { to: "/dashboard/categories", label: "Categories", icon: Tags },
  { to: "/dashboard/units", label: "Units", icon: Ruler },
  { to: "/dashboard/users", label: "Network Nodes", icon: Users },
];

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

  // Load fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  return (
    <div className="h-screen flex bg-[#0d0d0d] tracking-wide overflow-hidden text-white selection:bg-[#00e87a]/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Sidebar ── */}
      <aside
        className={`bg-[#0d0d0d] border-r border-[#222] flex flex-col transition-all duration-300 relative z-20 ${
          sidebarCollapsed ? "w-20" : "w-72"
        }`}
      >
        <div className="h-24 px-8 flex items-center justify-between border-b border-[#222]">
          {!sidebarCollapsed && (
            <motion.h1
              onClick={() => navigate("/")}
              className="text-2xl font-bold tracking-tight text-white cursor-pointer hover:opacity-80 transition-opacity"
              style={{ fontFamily: "'Syne', sans-serif" }}
              whileHover={{ scale: 1.02 }}
            >
              eAson<span className="text-[#00e87a] font-black">.</span>
            </motion.h1>
          )}
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors"
          >
            {sidebarCollapsed ? (
              <Menu className="w-5 h-5 text-gray-400 hover:text-white" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-400 hover:text-white" />
            )}
          </button>
        </div>

        <nav className="flex-1 py-8 px-4">
          <div className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.to);
              return (
                <NavLink key={item.to} to={item.to} end>
                  <motion.div
                    className={`flex items-center h-12 rounded-xl transition-all duration-200 ${
                      active 
                        ? "bg-[#111111] text-white font-bold border-l-4 border-[#00e87a]" 
                        : "hover:bg-[#1a1a1a] text-gray-500 hover:text-gray-200 border-l-4 border-transparent font-medium"
                    }`}
                  >
                    <div className="flex items-center gap-4 px-4 w-full text-sm">
                      <item.icon className={`w-5 h-5 ${active ? "text-[#00e87a]" : ""}`} />
                      {!sidebarCollapsed && <span>{item.label}</span>}
                    </div>
                  </motion.div>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* User Profile Area */}
        <div className="p-6 border-t border-[#222] bg-[#0a0a0a]">
          <div className={`flex items-center gap-4 ${sidebarCollapsed && "justify-center"}`}>
            <div className="w-10 h-10 rounded-full bg-[#1a1a1a] border border-[#333] text-[#00e87a] flex items-center justify-center font-bold text-lg uppercase shadow-lg shadow-[#00e87a]/5">
              {user?.firstName?.[0] || user?.fullName?.[0] || "A"}
            </div>
            {!sidebarCollapsed && (
              <div className="overflow-hidden">
                <p className="font-bold tracking-tight text-sm text-white truncate">{user?.firstName} {user?.lastName} {(user?.firstName || user?.lastName) ? '' : (user?.fullName || "Admin")}</p>
                <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || "admin@eason.com"}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col bg-[#0d0d0d] relative z-10 w-full overflow-hidden">
        
        {/* Top Header */}
        <header className="h-24 bg-[#0d0d0d]/80 backdrop-blur-md border-b border-[#222] flex items-center justify-between px-8 z-30 sticky top-0">
          <div className="flex items-center gap-6 flex-1">
            <button className="lg:hidden p-2 hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <Menu className="w-6 h-6 text-white" />
            </button>
            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search anything..."
                className="w-full pl-11 pr-4 py-2.5 bg-[#141414] border border-[#222] focus:outline-none focus:border-[#00e87a]/50 focus:ring-1 focus:ring-[#00e87a]/50 transition-colors rounded-xl placeholder:text-gray-600 text-sm font-medium text-white shadow-inner"
              />
            </div>
          </div>
          <div className="flex items-center gap-5">
            <button
              onClick={() => window.location.href = "/marketplace"}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-[#00e87a] bg-[#00e87a]/10 hover:bg-[#00e87a]/20 rounded-lg transition-colors border border-[#00e87a]/20 mr-2"
            >
              <Package className="w-4 h-4" />
              <span className="hidden sm:inline">Marketplace</span>
            </button>
            <button className="relative p-2 text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#00e87a] rounded-full border border-[#0d0d0d] shadow-[0_0_8px_#00e87a]"></span>
            </button>
            <div className="w-px h-6 bg-[#222]"></div>
            <button
              onClick={() => {
                logout();
                navigate("/", { replace: true });
              }}
              className="flex items-center gap-2 px-3 py-2 text-sm font-bold text-gray-400 hover:text-white hover:bg-[#1a1a1a] rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Main Content Scroll Area */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}