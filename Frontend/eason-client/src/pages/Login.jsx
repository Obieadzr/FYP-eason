// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import API from "../utils/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";

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
  const { login } = useAuth();
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
    
    login(res.data.token, res.data.user);

   
    const userRole = res.data.user.role; 

    if (userRole === "wholesaler" || userRole === "admin") {
      navigate("/dashboard", { replace: true });
    } else if (userRole === "retailer") {
     navigate("/marketplace", { replace: true });
    } else {
      // fallback
      navigate("/dashboard", { replace: true });
    }

  } catch (err) {
    setError(err.response?.data?.message || "Invalid email or password");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500,700&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative overflow-hidden font-['Satoshi'] flex items-center justify-center px-6">
        {/* Fiber Background */}
        <div className="absolute inset-0 opacity-60">
          <FiberBg />
        </div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-md">
          <div className="bg-white/80 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/50 p-10">
            {/* Logo */}
            <div className="text-center mb-12">
              <h1 className="text-6xl font-light tracking-tight text-gray-900">
                eAson
              </h1>
              <p className="text-sm text-gray-500 mt-2 tracking-widest">WHOLESALE OS</p>
            </div>

            <h2 className="text-3xl font-light text-gray-800 text-center mb-10">
              Sign in to continue
            </h2>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-6 py-5 bg-gray-50/70 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white transition text-base font-light"
              />

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-6 py-5 bg-gray-50/70 border border-gray-200 rounded-2xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:bg-white transition pr-16 text-base font-light"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white font-medium rounded-2xl hover:bg-emerald-700 disabled:opacity-60 transition text-base flex items-center justify-center gap-3"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Continue"}
              </button>
            </form>

            <div className="mt-8 text-center space-y-3">
              <a href="#" className="text-sm text-gray-600 hover:text-emerald-600 transition">
                Forgot your password?
              </a>
              <p className="text-sm text-gray-500">
                New to eAson?{" "}
                <Link to="/register" className="text-emerald-600 font-medium hover:underline">
                  Create account
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-gray-500 mt-10 tracking-wider">
            Made in Kathmandu • 2025
          </p>
        </div>
      </div>
    </>
  );
};

export default Login;