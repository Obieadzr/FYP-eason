// src/pages/auth/Login.jsx
import React, { useState, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import API from "../../utils/api.js";
import { useAuthStore } from "../../store/authStore";
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
    <Float speed={5} rotationIntensity={3} floatIntensity={3}>
      <Sphere args={[1, 32, 32]} scale={0.4} position={[1, -2.5, 0]}>
        <MeshDistortMaterial color="#a78bfa" distort={0.7} speed={5} roughness={0} metalness={1} transparent opacity={0.6} />
      </Sphere>
    </Float>
  </Canvas>
);

export default function Login() {
  const navigate = useNavigate();
  const { login: zustandLogin, checkAuth } = useAuthStore();

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
      localStorage.setItem("eason_token", token);
      zustandLogin(user);
      await checkAuth();
      const role = user?.role?.toLowerCase()?.trim();
      if (role === "admin") navigate("/dashboard", { replace: true });
      else if (role === "wholesaler") navigate(user.verified ? "/marketplace" : "/pending-approval", { replace: true });
      else navigate("/marketplace", { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500/60 focus:bg-white/8 transition-all text-base";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* LEFT */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#06060f]">
          <div className="absolute inset-0">
            <Suspense fallback={null}><FiberScene /></Suspense>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/25" />

          <div className="relative z-10 flex flex-col justify-between p-14 w-full">
            <div onClick={() => navigate("/")} className="text-xl font-semibold text-white cursor-pointer hover:opacity-75 transition tracking-tight">
              eAson<span className="text-emerald-400">.</span>
            </div>

            <div>
              <h1 className="text-5xl xl:text-6xl font-light text-white leading-tight tracking-tight">
                Good to have<br />
                <span className="font-semibold text-indigo-400">you back.</span>
              </h1>
              <p className="text-gray-500 mt-5 text-base font-normal max-w-xs leading-relaxed">
                Your suppliers and orders are waiting.
              </p>
            </div>

            <div className="text-xs text-gray-700 tracking-wide">© 2025 eAson</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 bg-[#09090b] flex items-center justify-center px-6 py-16 relative">
          <div className="absolute top-0 left-0 w-80 h-80 bg-indigo-900/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-md relative z-10">
            <div className="lg:hidden mb-10">
              <span onClick={() => navigate("/")} className="text-xl font-semibold text-white cursor-pointer">
                eAson<span className="text-emerald-400">.</span>
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-white tracking-tight">Sign in</h2>
              <p className="text-gray-500 mt-2 text-sm">Welcome back — enter your details below</p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <input
                type="email" placeholder="Email address" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
              />

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"} placeholder="Password" required
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-12`}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="flex justify-end">
                <a href="#" className="text-xs text-gray-600 hover:text-gray-400 transition">Forgot password?</a>
              </div>

              <button type="submit" disabled={loading}
                className="w-full py-4 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Sign in</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center mt-7 text-gray-600 text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-emerald-400 hover:text-emerald-300 transition font-medium">Create one</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}