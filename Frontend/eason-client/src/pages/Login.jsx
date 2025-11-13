// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

const Login = () => {
  const navigate = useNavigate();
  const [showPass, setShowPass] = useState(false);

  return (
    <>
      {/* Soft Background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-20 left-20 w-96 h-96 bg-purple-100 rounded-full blur-3xl opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-100 rounded-full blur-3xl opacity-50"></div>
      </div>

      <div className="min-h-screen flex items-center justify-center px-6 py-12 font-['Inter']">
        <div className="w-full max-w-md">
          {/* SINGLE GLASS CARD */}
          <div className="bg-white/80 backdrop-blur-3xl rounded-3xl shadow-2xl p-10 border border-white/40">
            <div className="text-center mb-10">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-9 h-9 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 3h18v18H3z" />
                  <path d="M3 9h18M9 21V9" />
                </svg>
              </div>
              <h1 className="text-4xl font-black text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mt-2">Sign in to your inventory dashboard</p>
            </div>

            <form className="space-y-6">
              <input
                type="email"
                placeholder="you@company.com"
                className="w-full px-5 py-4 bg-white/60 border border-gray-300 rounded-2xl text-sm placeholder-gray-500 
                           focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition"
              />

              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="Password"
                  className="w-full px-5 py-4 bg-white/60 border border-gray-300 rounded-2xl text-sm 
                             focus:outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 transition pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  {showPass ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                </button>
              </div>

              <div className="flex justify-between items-center text-sm">
                <label className="flex items-center gap-2">
                  <input type="checkbox" className="w-4 h-4 rounded border-gray-400" />
                  <span className="text-gray-700">Keep me signed in</span>
                </label>
                <a href="#" className="text-purple-600 font-semibold hover:underline">Forgot?</a>
              </div>

              <button className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl hover:bg-black transition transform hover:scale-[1.02]">
                Sign In
              </button>

              <p className="text-center text-sm text-gray-600 mt-6">
                New to eAson?{" "}
                <span
                  onClick={() => navigate("/register")}
                  className="text-purple-600 font-bold cursor-pointer hover:underline"
                >
                  Create account
                </span>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;