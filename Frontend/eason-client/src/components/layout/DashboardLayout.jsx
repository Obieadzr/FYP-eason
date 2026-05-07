import { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import {
  LayoutDashboard, Package, Tags, Ruler, Search, Bell,
  LogOut, ShieldCheck, Users, Truck, X, Store,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/dashboard/products", label: "Products" },
  { to: "/dashboard/verification", label: "KYC" },
  { to: "/dashboard/categories", label: "Categories" },
  { to: "/dashboard/units", label: "Units" },
  { to: "/dashboard/users", label: "Network" },
  { to: "/dashboard/logistics", label: "Logistics" },
];

export default function DashboardLayout({ children }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchVal, setSearchVal] = useState("");
  const [searchFocus, setSearchFocus] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => { try { document.head.removeChild(link); } catch { } };
  }, []);

  const isActive = (path) => {
    if (path === "/dashboard") return location.pathname === "/dashboard";
    return location.pathname.startsWith(path);
  };

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "Admin";
  const displayName = user?.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : user?.fullName || "Admin";

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#0c0c10", fontFamily: "'Inter', system-ui, sans-serif", color: "#F0EFF5" }}>

      {/* ── Topbar ── */}
      <header style={{
        height: 56,
        display: "flex",
        alignItems: "center",
        padding: "0 20px",
        gap: 16,
        background: "rgba(19,19,26,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        flexShrink: 0,
      }}>

        {/* Logo */}
        <button onClick={() => navigate("/")} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", flexShrink: 0 }}>
          {/* <div style={{ width: 20, height: 20, borderRadius: "50%", background: "linear-gradient(135deg, #7C3AED 50%, #1a1a2e 50%)", flexShrink: 0 }} /> */}
          <span style={{ fontSize: 15, fontWeight: 700, color: "#F0EFF5", letterSpacing: "-0.02em" }}>eAson.</span>
        </button>

        {/* Pill Nav */}
        <nav style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.to);
            return (
              <NavLink key={item.to} to={item.to} end={item.to === "/dashboard"} style={{ textDecoration: "none" }}>
                <div style={{
                  padding: "5px 16px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#111" : "rgba(255,255,255,0.5)",
                  background: active ? "#fff" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.15s",
                  whiteSpace: "nowrap",
                  letterSpacing: "-0.01em",
                }}>
                  {item.label}
                </div>
              </NavLink>
            );
          })}

          {/* Marketplace pill — highlighted */}
          <button
            onClick={() => navigate("/marketplace")}
            style={{
              padding: "5px 14px",
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              color: "#A78BFA",
              background: "rgba(124,58,237,0.15)",
              border: "1px solid rgba(124,58,237,0.3)",
              cursor: "pointer",
              transition: "all 0.15s",
              whiteSpace: "nowrap",
              marginLeft: 4,
            }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(124,58,237,0.25)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(124,58,237,0.15)"}
          >
            Marketplace
          </button>
        </nav>

        {/* Right cluster */}
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>

          {/* Search */}
          <div style={{ position: "relative" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#6B6880", pointerEvents: "none" }} />
            <input
              value={searchVal}
              onChange={e => setSearchVal(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
              placeholder="Search…"
              style={{
                background: "#13131A",
                border: `1px solid ${searchFocus ? "rgba(124,58,237,0.4)" : "rgba(255,255,255,0.06)"}`,
                boxShadow: searchFocus ? "0 0 0 3px rgba(124,58,237,0.08)" : "none",
                borderRadius: 8,
                paddingLeft: 32,
                paddingRight: searchVal ? 28 : 12,
                paddingTop: 6,
                paddingBottom: 6,
                color: "#F0EFF5",
                fontSize: 13,
                outline: "none",
                width: searchFocus ? 200 : 140,
                transition: "all 0.2s",
                caretColor: "#8B5CF6",
              }}
            />
            {searchVal && (
              <button onClick={() => setSearchVal("")} style={{ position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#6B6880" }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>

          {/* Bell */}
          <button style={{ position: "relative", padding: 8, borderRadius: 8, background: "none", border: "none", cursor: "pointer", color: "#6B6880", display: "flex" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.color = "#F0EFF5"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6B6880"; }}>
            <Bell style={{ width: 16, height: 16 }} />
            <span style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "#8B5CF6", border: "2px solid #13131A" }} />
          </button>

          {/* Divider */}
          <div style={{ width: 1, height: 16, background: "rgba(255,255,255,0.08)", margin: "0 4px" }} />

          {/* Profile */}
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              onClick={() => setProfileOpen(o => !o)}
              style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0", background: "none", border: "none", cursor: "pointer" }}
            >
              <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#7C3AED,#5B21B6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {firstName[0].toUpperCase()}
              </div>
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.15 }}
                  style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 200, background: "#1A1A24", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}>
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#F0EFF5", margin: 0 }}>{displayName}</p>
                    <p style={{ fontSize: 11, color: "#6B6880", margin: "2px 0 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email || "admin@eason.com"}</p>
                  </div>
                  <div style={{ padding: 6 }}>
                    <button
                      onClick={() => { logout(); navigate("/", { replace: true }); }}
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 8, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#6B6880", textAlign: "left" }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#EF4444"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6B6880"; }}
                    >
                      <LogOut style={{ width: 14, height: 14 }} /> Sign out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main */}
      <main style={{ flex: 1, overflow: "auto" }}>
        {children}
      </main>
    </div>
  );
}