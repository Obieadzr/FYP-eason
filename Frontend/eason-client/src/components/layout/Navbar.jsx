// src/components/layout/Navbar.jsx
// Used ONLY on the public landing page — no auth icons, no cart
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Menu, X, ChevronDown, Package, User, LogOut } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered]   = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const links = [
    { label: "How it Works", href: "#how" },
    { label: "For Retailers", href: "#retailers" },
    { label: "For Suppliers", href: "#suppliers" },
    { label: "Contact",       href: "#contact" },
  ];

  const handleCta = () => navigate(isAuthenticated ? "/marketplace" : "/register");

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed inset-x-4 top-4 z-50 mx-auto max-w-6xl transition-all duration-700 ${
          scrolled
            ? "rounded-2xl bg-white/96 backdrop-blur-2xl shadow-lg shadow-black/5 border border-gray-200"
            : "rounded-3xl bg-black/30 backdrop-blur-md border border-white/10"
        }`}
      >
        <div className="px-6 py-4 flex items-center justify-between">
          {/* Logo */}
          <motion.button
            onClick={() => navigate(isAuthenticated ? "/marketplace" : "/")}
            whileTap={{ scale: 0.97 }}
            className={`text-xl font-bold tracking-tight transition-colors ${scrolled ? "text-gray-900" : "text-white"}`}
          >
            eAson<span className="text-emerald-500">.</span>
          </motion.button>

          {/* Desktop links — centered */}
          <div className="hidden md:flex items-center gap-1 absolute left-1/2 -translate-x-1/2">
            {links.map(link => (
              <a
                key={link.label}
                href={link.href}
                onMouseEnter={() => setHovered(link.label)}
                onMouseLeave={() => setHovered(null)}
                className={`relative px-4 py-2 text-sm font-medium rounded-xl transition-colors ${
                  scrolled ? "text-gray-500 hover:text-gray-900" : "text-white/60 hover:text-white"
                }`}
              >
                {link.label}
                <AnimatePresence>
                  {hovered === link.label && (
                    <motion.span
                      layoutId="pill"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className={`absolute inset-0 rounded-xl -z-10 ${scrolled ? "bg-gray-100" : "bg-white/10"}`}
                    />
                  )}
                </AnimatePresence>
              </a>
            ))}
          </div>

          {/* Right CTA */}
          <div className="flex items-center gap-3">
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/login")}
                className={`hidden sm:block text-sm font-medium transition-colors ${
                  scrolled ? "text-gray-500 hover:text-gray-900" : "text-white/60 hover:text-white"
                }`}
              >
                Sign in
              </button>
            )}

            {isAuthenticated && user ? (
              <div className="avatar-dropdown-root relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-sm hover:shadow-lg transition-all"
                >
                  {user?.fullName?.[0]?.toUpperCase() || user?.firstName?.[0]?.toUpperCase() || "U"}
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 shadow-xl z-50 py-1 rounded-xl overflow-hidden"
                    >
                      {/* User info header */}
                      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/50">
                        <p className="text-sm font-bold text-gray-900 truncate">{user?.fullName || `${user?.firstName} ${user?.lastName}`}</p>
                        <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email}</p>
                      </div>

                      {/* Menu items */}
                      <div className="py-1">
                        <button
                          onClick={() => { navigate("/orders"); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          My Orders
                        </button>
                        <button
                          onClick={() => { navigate("/profile"); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          My Profile
                        </button>
                      </div>

                      {/* Logout */}
                      <div className="border-t border-gray-100 py-1">
                        <button
                          onClick={() => { logout(); navigate("/"); setDropdownOpen(false); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleCta}
                className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
              >
                Get Started
              </motion.button>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`md:hidden p-2 rounded-xl transition ${scrolled ? "text-gray-600 hover:bg-gray-100" : "text-white hover:bg-white/10"}`}
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden border-t border-white/10 md:hidden"
            >
              <div className="px-6 py-4 space-y-1">
                {links.map(l => (
                  <a
                    key={l.label}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block px-4 py-3 rounded-xl text-sm font-medium transition ${
                      scrolled ? "text-gray-600 hover:bg-gray-50 hover:text-gray-900" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {l.label}
                  </a>
                ))}
                <div className="pt-3 border-t border-white/10 flex gap-2">
                  {!isAuthenticated && (
                    <button onClick={() => { setMenuOpen(false); navigate("/login"); }}
                      className="flex-1 py-3 border border-white/20 text-white/70 rounded-xl text-sm font-medium">
                      Sign in
                    </button>
                  )}
                  <button onClick={() => { setMenuOpen(false); isAuthenticated ? navigate("/marketplace") : handleCta(); }}
                    className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-sm font-semibold">
                    {isAuthenticated ? "Marketplace" : "Get Started"}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}