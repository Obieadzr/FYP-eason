// src/pages/auth/Register.jsx
import React, { useState, Suspense } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import API from "../../utils/api.js";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere, MeshWobbleMaterial, Torus } from "@react-three/drei";

const FiberScene = () => (
  <Canvas camera={{ position: [0, 0, 7], fov: 55 }} dpr={[1, 2]}>
    <ambientLight intensity={0.4} />
    <directionalLight position={[10, 10, 5]} intensity={1.5} color="#10b981" />
    <directionalLight position={[-10, -5, -5]} intensity={0.5} color="#14b8a6" />
    <pointLight position={[0, 0, 3]} intensity={1} color="#fff" />

    <Float speed={1.5} rotationIntensity={0.6} floatIntensity={1.5}>
      <Sphere args={[1, 128, 128]} scale={2.8}>
        <MeshDistortMaterial color="#10b981" distort={0.35} speed={2.5} roughness={0.05} metalness={0.95} transparent opacity={0.18} />
      </Sphere>
    </Float>
    <Float speed={2.5} rotationIntensity={1.2} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} scale={1.6} position={[2.5, 1.2, -1.5]}>
        <MeshDistortMaterial color="#14b8a6" distort={0.45} speed={3} roughness={0.1} metalness={0.9} transparent opacity={0.22} />
      </Sphere>
    </Float>
    <Float speed={1.8} rotationIntensity={0.9} floatIntensity={1.2}>
      <Sphere args={[1, 64, 64]} scale={1.1} position={[-2.8, -1.8, -2]}>
        <MeshDistortMaterial color="#059669" distort={0.5} speed={2} roughness={0.15} metalness={0.85} transparent opacity={0.28} />
      </Sphere>
    </Float>
    <Float speed={1} rotationIntensity={2} floatIntensity={0.8}>
      <Torus args={[1.8, 0.12, 32, 100]} position={[0.5, 0, -1]}>
        <MeshWobbleMaterial color="#34d399" factor={0.3} speed={1.5} roughness={0.1} metalness={0.9} transparent opacity={0.35} />
      </Torus>
    </Float>
    <Float speed={4} rotationIntensity={2} floatIntensity={3}>
      <Sphere args={[1, 32, 32]} scale={0.5} position={[-1.5, 2, 0]}>
        <MeshDistortMaterial color="#6ee7b7" distort={0.6} speed={4} roughness={0} metalness={1} transparent opacity={0.5} />
      </Sphere>
    </Float>
  </Canvas>
);

const Register = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    fname: "", lname: "", email: "", password: "", confirmPassword: "", role: "retailer",
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Passwords don't match");
    setLoading(true);
    try {
      await API.post("/auth/register", {
        firstName: formData.fname,
        lastName: formData.lname,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/60 focus:bg-white/8 transition-all text-base";

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

      <div className="min-h-screen flex overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

        {/* LEFT */}
        <div className="hidden lg:flex flex-1 relative overflow-hidden bg-[#030a06]">
          <div className="absolute inset-0">
            <Suspense fallback={null}><FiberScene /></Suspense>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

          <div className="relative z-10 flex flex-col justify-between p-14 w-full">
            <div onClick={() => navigate("/")} className="text-xl font-semibold text-white cursor-pointer hover:opacity-75 transition tracking-tight">
              eAson<span className="text-emerald-400">.</span>
            </div>

            <div>
              <h1 className="text-5xl xl:text-6xl font-light text-white leading-tight tracking-tight">
                Wholesale,<br />
                <span className="font-semibold text-emerald-400">without the chaos.</span>
              </h1>
              <p className="text-gray-500 mt-5 text-base font-normal max-w-xs leading-relaxed">
                Order from suppliers across Kathmandu without leaving your shop.
              </p>
            </div>

            <div className="text-xs text-gray-700 tracking-wide">© 2025 eAson</div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex-1 bg-[#09090b] flex items-center justify-center px-6 py-16 relative">
          <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-900/15 rounded-full blur-3xl pointer-events-none" />

          <div className="w-full max-w-md relative z-10">
            <div className="lg:hidden mb-10">
              <span onClick={() => navigate("/")} className="text-xl font-semibold text-white cursor-pointer">
                eAson<span className="text-emerald-400">.</span>
              </span>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold text-white tracking-tight">Create an account</h2>
              <p className="text-gray-500 mt-2 text-sm">Fill in below to get started</p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <input type="text" name="fname" placeholder="First name" required value={formData.fname} onChange={handleChange} className={inputCls} />
                <input type="text" name="lname" placeholder="Last name" required value={formData.lname} onChange={handleChange} className={inputCls} />
              </div>

              <input type="email" name="email" placeholder="Email address" required value={formData.email} onChange={handleChange} className={inputCls} />

              <select
                name="role" value={formData.role} onChange={handleChange}
                className={`${inputCls} cursor-pointer`}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%236b7280' viewBox='0 0 20 20'%3E%3Cpath d='M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center", backgroundSize: "1.25em", appearance: "none",
                }}
              >
                <option value="retailer" className="bg-zinc-900">I'm a retailer — I want to buy</option>
                <option value="wholesaler" className="bg-zinc-900">I'm a wholesaler — I want to sell</option>
              </select>

              <div className="relative">
                <input type={showPass ? "text" : "password"} name="password" placeholder="Password" required value={formData.password} onChange={handleChange} className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="relative">
                <input type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="Confirm password" required value={formData.confirmPassword} onChange={handleChange} className={`${inputCls} pr-12`} />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition">
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <button type="submit" disabled={loading}
                className="w-full mt-1 py-4 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>Create account</span><ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>

            <p className="text-center mt-7 text-gray-600 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-emerald-400 hover:text-emerald-300 transition font-medium">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;