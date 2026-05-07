// src/pages/auth/Register.jsx
import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import api from "../../utils/api";

/* ─── Password strength ─────────────────────────────────── */
function pwStrength(pw) {
  if (!pw) return 0;
  let s = 0;
  if (pw.length >= 6) s++;
  if (pw.length >= 10 && /[A-Z]/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw) && pw.length >= 8) s++;
  return Math.min(s, 3);
}

const strengthColor = ["bg-red-500", "bg-amber-400", "bg-emerald-400"];
const strengthLabel = ["Weak", "", ""];

/* ─── OTP Box ────────────────────────────────────────────── */
function OTPInput({ value, onChange }) {
  const refs = Array.from({ length: 6 }, () => useRef(null));
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleKey = (i, e) => {
    if (e.key === "Backspace") {
      const next = digits.map((d, idx) => (idx === i ? "" : d)).join("");
      onChange(next);
      if (i > 0) refs[i - 1].current?.focus();
    }
  };

  const handleChange = (i, e) => {
    const char = e.target.value.replace(/\D/g, "").slice(-1);
    const next = digits.map((d, idx) => (idx === i ? char : d)).join("").trim();
    onChange(next);
    if (char && i < 5) refs[i + 1].current?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={(e) => handleChange(i, e)}
          onKeyDown={(e) => handleKey(i, e)}
          className="w-10 h-12 text-center text-lg font-mono bg-transparent border border-white/12 rounded-lg text-white focus:border-white/50 outline-none transition-colors"
        />
      ))}
    </div>
  );
}

/* ─── Main ───────────────────────────────────────────────── */
export default function Register() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [step, setStep] = useState(1);
  const [role, setRole] = useState("retailer");
  const [form, setForm] = useState({ name: "", email: "", password: "", businessName: "" });
  const [otp, setOtp] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  const strength = pwStrength(form.password);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleStep1 = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all fields.");
      triggerShake();
      return;
    }
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      triggerShake();
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/send-otp", { email: form.email });
      toast.success("OTP sent to your email.");
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleStep2 = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      toast.error("Enter the 6-digit OTP.");
      triggerShake();
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/auth/register", { ...form, role, otp });
      if (data.token) {
        localStorage.setItem("eason_token", data.token);
        login(data.user);
        toast.success("Account created! Welcome to eAson.");
        const r = data.user?.role;
        if (r === "admin") navigate("/dashboard");
        else navigate("/profile");
      } else {
        toast.success("Account created! Please log in.");
        navigate("/login");
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Registration failed.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden px-4">

      {/* Premium back button */}
      <Link
        to="/"
        className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white/80 transition-all duration-200 group"
        style={{ textDecoration: "none" }}
      >
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(8px)",
            transition: "all 200ms",
          }}
          className="group-hover:border-white/20 group-hover:bg-white/8"
        >
          <ArrowLeft size={14} />
        </span>
        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em" }}>eAson</span>
      </Link>
      {/* Noise */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
        }}
      />
      {/* Blob */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          width: 600, height: 600, borderRadius: "50%",
          background: "radial-gradient(circle, #6366f1 0%, transparent 70%)",
          opacity: 0.06, top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "blobDrift 20s ease-in-out infinite",
        }}
      />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        @keyframes blobDrift {
          0%, 100% { transform: translate(-50%, -50%) scale(1); }
          33% { transform: translate(-44%, -54%) scale(1.08); }
          66% { transform: translate(-56%, -46%) scale(0.96); }
        }
      `}</style>

      <motion.div
        animate={shake ? { x: [-4, 4, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Logo */}
          <div className="mb-12 text-center">
            <Link to="/" className="text-sm font-medium tracking-widest text-white/80 hover:text-white transition-colors">
              eAson.
            </Link>
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <div className="mb-8">
                  <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Create account</h1>
                  <p className="text-sm text-white/40">Join Nepal's wholesale network in minutes.</p>
                </div>

                {/* Role toggle */}
                <div className="border border-white/10 rounded-lg p-1 flex gap-1 mb-6">
                  {["retailer", "wholesaler"].map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all capitalize ${
                        role === r ? "bg-white/10 text-white" : "text-white/30 hover:text-white/50"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <form onSubmit={handleStep1} className="space-y-4">
                  <div>
                    <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Full Name</label>
                    <input
                      type="text" placeholder="Eason Tamang"
                      value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/40"
                    />
                  </div>

                  {role === "wholesaler" && (
                    <div>
                      <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Business Name</label>
                      <input
                        type="text" placeholder="Tamang Traders Pvt. Ltd."
                        value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })}
                        className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/40"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Email</label>
                    <input
                      type="email" placeholder="you@example.com"
                      value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/40"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Password</label>
                    <div className="relative">
                      <input
                        type={showPw ? "text" : "password"} placeholder="••••••••"
                        value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/40"
                      />
                      <button type="button" onClick={() => setShowPw(!showPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {/* Strength bars */}
                    {form.password && (
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3].map((lvl) => (
                          <motion.div
                            key={lvl}
                            className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                              strength >= lvl ? strengthColor[strength - 1] : "bg-white/10"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    {strength === 1 && form.password && (
                      <p className="text-[10px] text-red-400 mt-1">Weak — try adding numbers or symbols</p>
                    )}
                  </div>

                  <motion.button
                    type="submit" whileTap={{ scale: 0.98 }} disabled={loading}
                    className="w-full mt-2 bg-white text-black font-medium text-sm rounded-lg py-2.5 hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending OTP...</> : "Continue"}
                  </motion.button>
                </form>

                <div className="mt-8 text-center space-y-3">
                  <p className="text-sm text-white/30">
                    Already have an account?{" "}
                    <Link to="/login" className="text-white/60 hover:text-white transition-colors">Sign in</Link>
                  </p>
                  <p className="text-[11px] text-white/20">Trusted by verified traders across Nepal</p>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35 }}
              >
                <button onClick={() => setStep(1)} className="flex items-center gap-1.5 text-white/30 hover:text-white/70 text-xs mb-8 transition-colors">
                  <ArrowLeft className="w-3.5 h-3.5" /> Back
                </button>

                <div className="mb-8">
                  <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Verify email</h1>
                  <p className="text-sm text-white/40">
                    We sent a 6-digit code to <span className="text-white/60">{form.email}</span>
                  </p>
                </div>

                <form onSubmit={handleStep2} className="space-y-6">
                  <OTPInput value={otp} onChange={setOtp} />

                  <motion.button
                    type="submit" whileTap={{ scale: 0.98 }} disabled={loading || otp.length < 6}
                    className="w-full bg-white text-black font-medium text-sm rounded-lg py-2.5 hover:bg-white/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : "Create account"}
                  </motion.button>

                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await api.post("/auth/send-otp", { email: form.email });
                        toast.success("New OTP sent.");
                      } catch { toast.error("Failed to resend."); }
                    }}
                    className="w-full text-center text-[11px] text-white/25 hover:text-white/50 transition-colors"
                  >
                    Didn't receive it? Resend code
                  </button>
                </form>

                <p className="mt-8 text-center text-[11px] text-white/20">Trusted by verified traders across Nepal</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
}