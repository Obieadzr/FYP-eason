// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../utils/api.js";
import { Eye, EyeOff } from "lucide-react";

const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fname: "", lname: "", email: "", password: "", confirmPassword: "", role: "retailer"
  });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
      setError(err.response?.data?.message || "Failed to register");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Soft Background Orbs */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-32 left-32 w-80 h-80 bg-purple-200 rounded-full blur-3xl opacity-30"></div>
        <div className="absolute bottom-40 right-40 w-72 h-72 bg-blue-200 rounded-full blur-3xl opacity-30"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center px-6 py-12 font-['Inter']">
        <div className="flex flex-col lg:flex-row gap-8 max-w-6xl w-full items-stretch">

          {/* LEFT: Form Card */}
          <div className="flex-1">
            <div className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-2xl p-10 border border-white/40 h-full flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 3h18v18H3z" />
                    <path d="M3 9h18M9 21V9" />
                  </svg>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">eAson</h1>
                  <p className="text-xs text-gray-500">Inventory Management</p>
                </div>
              </div>

              <h2 className="text-5xl font-black text-gray-900 mb-3">Create Account</h2>
              <p className="text-gray-600 text-base mb-10">
                Join eAson to modernize your inventory operations.
              </p>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <input
                    type="text" name="fname" placeholder="First name" required onChange={handleChange}
                    className="px-5 py-4 bg-white/70 border border-gray-300 rounded-2xl text-sm placeholder-gray-500 
                               focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition duration-200" />
                  <input
                    type="text" name="lname" placeholder="Last name" required onChange={handleChange}
                    className="px-5 py-4 bg-white/70 border border-gray-300 rounded-2xl text-sm placeholder-gray-500 
                               focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition duration-200" />
                </div>

                <input
                  type="email" name="email" placeholder="Work email" required onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/70 border border-gray-300 rounded-2xl text-sm placeholder-gray-500 
                             focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition duration-200" />

                <div className="grid grid-cols-2 gap-5">
                  <div className="relative">
                    <input
                      type={showPass ? "text" : "password"} name="password" placeholder="Password" required onChange={handleChange}
                      className="w-full px-5 py-4 bg-white/70 border border-gray-300 rounded-2xl text-sm 
                                 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition duration-200 pr-12" />
                    <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2">
                      {showPass ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"} name="confirmPassword" placeholder="Confirm" required onChange={handleChange}
                      className="w-full px-5 py-4 bg-white/70 border border-gray-300 rounded-2xl text-sm 
                                 focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition duration-200 pr-12" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-4 top-1/2 -translate-y-1/2">
                      {showConfirm ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </button>
                  </div>
                </div>

                {error && <p className="text-red-500 text-sm font-medium">{error}</p>}

                <p className="text-xs text-gray-600">
                  By creating an account, you agree to our <a href="#" className="text-purple-600 font-semibold">Terms</a> and <a href="#" className="text-purple-600 font-semibold">Privacy</a>.
                </p>

                <button
                  type="submit" disabled={loading}
                  className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition transform hover:scale-[1.02] duration-200 text-base">
                  {loading ? "Creating..." : "Create account"}
                </button>

                <p className="text-center text-sm text-gray-600 mt-8">
                  Already have an account?{" "}
                  <span onClick={() => navigate("/login")} className="text-purple-600 font-bold cursor-pointer hover:underline">
                    Sign in
                  </span>
                </p>
              </form>
            </div>
          </div>

          {/* RIGHT: TRUE FROSTED GLASS CARD (LIKE APPLE) */}
          <div className="flex-1">
            <div className="bg-white/20 backdrop-blur-3xl rounded-3xl shadow-2xl p-10 border border-white/30 h-full flex flex-col justify-center">
              <div className="text-gray-800">
                <p className="text-sm font-bold uppercase tracking-wider mb-3">Everything you need to start</p>
                <p className="text-base mb-10 leading-relaxed">
                  Set up in minutes with guided steps and live validation. No credit card required.
                </p>

                <div className="grid grid-cols-2 gap-6">
                  {[
                    { title: "Team workspaces", desc: "Invite teammates, set roles and manage permissions easily." },
                    { title: "Enterprise security", desc: "SSO-ready, audit logs and data export at any time." },
                    { title: "Fast imports", desc: "Import products from CSV or Excel with error hints." },
                    { title: "Guided success", desc: "Interactive checklist to complete your setup." },
                  ].map((item, i) => (
                    <div key={i} className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50">
                      <p className="font-bold text-gray-900 text-sm">{item.title}</p>
                      <p className="text-xs text-gray-700 mt-2 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-10 bg-white/60 backdrop-blur-xl rounded-2xl p-8 border border-white/40">
                  <p className="font-bold text-gray-900">Everything in one place</p>
                  <p className="text-sm text-gray-700 mt-3">
                    Centralize inventory, orders and suppliers in a single dashboard with powerful filters and exports.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;