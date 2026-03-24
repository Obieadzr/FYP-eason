// src/components/layout/Navbar.jsx
// Used ONLY on the public landing page — no auth icons, no cart
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { Menu, X } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered]   = useState(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
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
            onClick={() => navigate("/")}
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
            <button
              onClick={() => navigate("/login")}
              className={`hidden sm:block text-sm font-medium transition-colors ${
                scrolled ? "text-gray-500 hover:text-gray-900" : "text-white/60 hover:text-white"
              }`}
            >
              Sign in
            </button>

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCta}
              className={`px-5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                scrolled
                  ? "bg-black text-white hover:bg-gray-900 shadow-sm"
                  : "bg-white text-black hover:bg-gray-100"
              }`}
            >
              {isAuthenticated ? "Go to Market" : "Get Started"}
            </motion.button>

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
                  <button onClick={() => { setMenuOpen(false); navigate("/login"); }}
                    className="flex-1 py-3 border border-white/20 text-white/70 rounded-xl text-sm font-medium">
                    Sign in
                  </button>
                  <button onClick={() => { setMenuOpen(false); handleCta(); }}
                    className="flex-1 py-3 bg-white text-black rounded-xl text-sm font-semibold">
                    {isAuthenticated ? "Go to Market" : "Get Started"}
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