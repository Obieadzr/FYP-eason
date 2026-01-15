// src/pages/Login.jsx — Version 2 (more premium feel)
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import API from "../utils/api.js";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useAuthStore } from "../store/authStore";

const FiberBg = () => (
  <Canvas camera={{ position: [0, 0, 10], fov: 70 }}>
    <ambientLight intensity={0.8} />
    <Float speed={4} rotationIntensity={0.6} floatIntensity={1.5}>
      <Sphere args={[1, 128, 128]} scale={4}>
        <MeshDistortMaterial
          color="#10b981"
          attach="material"
          distort={0.35}
          speed={1.8}
          roughness={0}
          metalness={0.95}
          transparent
          opacity={0.18}
        />
      </Sphere>
    </Float>
  </Canvas>
);

const Login = () => {
  const navigate = useNavigate();
  const { login: zustandLogin } = useAuthStore();

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const res = await API.post("/auth/login", { email, password });
    const { token, user } = res.data;

    console.log("LOGIN RESPONSE:", { token, user });

    // ── Critical order ──
    localStorage.setItem("eason_token", token);
    useAuthStore.getState().login(user); // ← direct store update

    // Clean old junk (from previous context version)
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    const role = (user?.role || "").trim().toLowerCase();

    console.log("LOGIN SUCCESS → role:", role);

    // Immediate redirect based on fresh data
    if (role === "admin") {
      console.log("→ Redirecting ADMIN to /dashboard");
      navigate("/dashboard", { replace: true });
    } else if (role === "retailer") {
      console.log("→ Redirecting RETAILER to /marketplace");
      navigate("/marketplace", { replace: true });
    } else if (role === "wholesaler") {
      const dest = user.verified ? "/dashboard" : "/pending-approval";
      console.log(`→ Wholesaler (${user.verified ? "verified" : "pending"}) → ${dest}`);
      navigate(dest, { replace: true });
    } else {
      console.warn("Unknown role → fallback to dashboard");
      navigate("/dashboard", { replace: true });
    }
  } catch (err) {
    setError(err.response?.data?.message || "Login failed. Please try again.");
    console.error("Login error:", err);
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden font-['Satoshi'] flex items-center justify-center px-6">
        <div className="absolute inset-0 opacity-60">
          <FiberBg />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-12">
            <div className="text-center mb-12">
              <h1 className="text-6xl font-light tracking-tight text-gray-900">eAson</h1>
              <p className="text-sm text-gray-500 mt-2 tracking-widest uppercase">Wholesale OS</p>
            </div>

            <h2 className="text-3xl font-light text-gray-800 text-center mb-10">Sign in to your account</h2>

            {error && (
              <div className="mb-8 p-5 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-7">
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-5 bg-gray-50/70 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white transition text-lg font-medium"
              />

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-6 py-5 bg-gray-50/70 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white transition pr-16 text-lg font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition"
                >
                  {showPass ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-medium rounded-2xl hover:from-emerald-700 hover:to-teal-700 disabled:opacity-60 transition-all duration-300 shadow-lg flex items-center justify-center gap-3 text-lg"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-6 h-6 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </button>
            </form>

            <div className="mt-10 text-center space-y-4">
              <a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition">
                Forgot password?
              </a>
              <p className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Link to="/register" className="text-emerald-600 font-semibold hover:underline">
                  Sign up →
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-12 tracking-wider">
            Made in Kathmandu • 2025
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;