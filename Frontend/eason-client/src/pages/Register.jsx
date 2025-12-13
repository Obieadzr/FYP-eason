// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import API from "../utils/api.js";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, Sphere } from "@react-three/drei";
import { useRef } from "react";

const FiberScene = () => (
  <Canvas camera={{ position: [0, 0, 8], fov: 60 }}>
    <ambientLight intensity={1} />
    <directionalLight position={[10, 10, 5]} intensity={1} />
    <Float speed={2} rotationIntensity={1} floatIntensity={2}>
      <Sphere args={[1, 64, 64]} scale={3}>
        <MeshDistortMaterial
          color="#10b981"
          attach="material"
          distort={0.3}
          speed={2}
          roughness={0.1}
          metalness={0.8}
          transparent
          opacity={0.25}
        />
      </Sphere>
    </Float>
    <Float speed={3} rotationIntensity={0.8} floatIntensity={1.5}>
      <Sphere args={[1, 64, 64]} scale={2.2} position={[2, -1, -2]}>
        <MeshDistortMaterial
          color="#14b8a6"
          attach="material"
          distort={0.4}
          speed={2.5}
          roughness={0.2}
          metalness={0.9}
          transparent
          opacity={0.2}
        />
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
    fname: "", lname: "", email: "", password: "", confirmPassword: "", role: "retailer"
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

  return (
    <>
      {/* Satoshi Light & Medium only */}
      <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,700&display=swap" rel="stylesheet" />

      <div className="min-h-screen flex font-['Satoshi'] overflow-hidden">
        {/* LEFT: Drei Fiber Magic */}
        <div className="hidden lg:block flex-1 bg-gradient-to-br from-emerald-50 via-white to-teal-50 relative">
          <div className="absolute inset-0">
            <FiberScene />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
          <div className="relative h-full flex items-center justify-center">
            <div className="text-center px-10">
              <h1 className="text-7xl font-medium tracking-tight text-gray-900">
                eAson
              </h1>
              <p className="text-xl text-gray-600 mt-4 tracking-wide">
                Wholesale, reimagined.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: Ultra Minimal Form */}
        <div className="flex-1 bg-black flex items-center justify-center px-6 py-16">
          <div className="w-full max-w-md">
            <div className="mb-16 text-center">
              <h2 className="text-5xl font-medium text-white tracking-tight">
                Create your account
              </h2>
              <p className="text-gray-500 mt-3 text-sm">
                Join thousands of Nepali businesses
              </p>
            </div>

            {error && (
              <div className="mb-8 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text" name="fname" placeholder="First name" required
                  value={formData.fname} onChange={handleChange}
                  className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition text-base"
                />
                <input
                  type="text" name="lname" placeholder="Last name" required
                  value={formData.lname} onChange={handleChange}
                  className="px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition text-base"
                />
              </div>

              <input
                type="email" name="email" placeholder="you@business.com" required
                value={formData.email} onChange={handleChange}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition text-base"
              />

              <select
                name="role" value={formData.role} onChange={handleChange}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition text-base"
              >
                <option value="retailer">Retailer</option>
                <option value="wholesaler">Wholesaler</option>
              </select>

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password" placeholder="Password" required
                  value={formData.password} onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition pr-14 text-base"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showPass ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword" placeholder="Confirm password" required
                  value={formData.confirmPassword} onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/10 transition pr-14 text-base"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full py-5 bg-emerald-600 text-white font-medium rounded-xl hover:bg-emerald-500 disabled:opacity-50 transition flex items-center justify-center gap-3 text-base"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Create account"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </form>

            <p className="text-center mt-10 text-gray-500 text-sm">
              Already have an account?{" "}
              <span onClick={() => navigate("/login")} className="text-emerald-400 font-medium cursor-pointer hover:underline">
                Sign in
              </span>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;