// src/pages/auth/Login.jsx
import React, { useState, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import API from "../../utils/api.js";
import { useAuthStore } from "../../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, MeshWobbleMaterial, TorusKnot } from "@react-three/drei";

const FiberScene = () => (
  <Canvas camera={{ position: [0, 0, 6], fov: 60 }} dpr={[1, 2]}>
    <ambientLight intensity={0.3} />
    <directionalLight position={[-10, 10, 5]} intensity={1.8} color="#6366f1" />
    <directionalLight position={[10, -5, -5]} intensity={0.8} color="#10b981" />
    <pointLight position={[0, 2, 2]} intensity={1.5} color="#818cf8" />
    <Float speed={0.8} rotationIntensity={0.8} floatIntensity={0.6}>
      <TorusKnot args={[1.2, 0.35, 256, 32]} scale={1.4}>
        <MeshWobbleMaterial color="#10b981" factor={0.15} speed={1} roughness={0.05} metalness={0.98} transparent opacity={0.22} />
      </TorusKnot>
    </Float>
    <Float speed={3} rotationIntensity={2} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} scale={0.9} position={[2.5, 1.5, -1]}>
        <MeshDistortMaterial color="#818cf8" distort={0.5} speed={3} roughness={0.05} metalness={0.95} transparent opacity={0.3} />
      </Sphere>
    </Float>
    <Float speed={2} rotationIntensity={1.5} floatIntensity={1.5}>
      <Sphere args={[1, 64, 64]} scale={1.3} position={[-2, -1.5, -2]}>
        <MeshDistortMaterial color="#14b8a6" distort={0.4} speed={2.5} roughness={0.1} metalness={0.9} transparent opacity={0.2} />
      </Sphere>
    </Float>
  </Canvas>
);

const inputCls = "w-full bg-white/5 border border-white/10 text-white placeholder-white/20 text-sm px-4 py-3.5 rounded-xl focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/15 transition";

export default function Login() {
  const navigate = useNavigate();
  const { login: zustandLogin, checkAuth } = useAuthStore();

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", { email, password });
      // Store token so API calls are authenticated
      if (res.data.token) {
        localStorage.setItem("eason_token", res.data.token);
      }
      zustandLogin(res.data.user);
      await checkAuth();
      const role = res.data.user?.role;
      navigate(role === "admin" ? "/dashboard" : role === "wholesaler" ? "/profile" : "/marketplace");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080808] grid lg:grid-cols-2" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>
      {/* Left — 3D scene */}
      <div className="relative hidden lg:block overflow-hidden">
        <Suspense fallback={null}>
          <FiberScene />
        </Suspense>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#080808]/60" />
        <div className="absolute bottom-16 left-16 right-16">
          <h1 className="text-5xl font-light text-white leading-tight tracking-tighter">
            Good to have<br />
            <span className="text-emerald-400 font-semibold">you back.</span>
          </h1>
          <p className="mt-4 text-white/40 text-sm leading-relaxed max-w-xs">
            Your orders, stock, and suppliers — all waiting right where you left them.
          </p>
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center px-8 py-16">
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <Link to="/" className="inline-block text-xl font-bold text-white mb-12">
            eAson<span className="text-emerald-400">.</span>
          </Link>

          <h2 className="text-3xl font-semibold text-white mb-1">Sign in</h2>
          <p className="text-white/35 text-sm mb-10">
            New here?{" "}
            <Link to="/register" className="text-emerald-400 hover:text-emerald-300 font-medium transition">
              Create an account
            </Link>
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-white/40 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className={inputCls}
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Password</label>
                <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 transition">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Your password"
                  required
                  autoComplete="current-password"
                  className={`${inputCls} pr-11`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-3.5 text-white/30 hover:text-white/60 transition"
                >
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 px-4 py-3 rounded-xl"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.button
              type="submit"
              disabled={loading}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 bg-white text-black font-semibold rounded-xl hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 mt-2 text-sm"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {loading ? "Signing in..." : "Sign In"}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </motion.button>
          </form>

          <p className="mt-8 text-center text-white/20 text-xs">
            By signing in you agree to our{" "}
            <a href="#" className="text-white/40 hover:text-white transition">Terms</a> and{" "}
            <a href="#" className="text-white/40 hover:text-white transition">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}