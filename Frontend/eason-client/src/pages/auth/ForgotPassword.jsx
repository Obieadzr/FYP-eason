import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { Loader2, ArrowLeft, EyeOff, Eye } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [step, setStep] = useState(1); // 1: Request OTP, 2: Reset Password
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPw, setShowPw] = useState(false);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email.");
      triggerShake();
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to send OTP.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!otp || !newPassword) {
      toast.error("Please fill in all fields.");
      triggerShake();
      return;
    }
    setLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      toast.success("Password reset successfully! Please log in.");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset password.");
      triggerShake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden px-4">
      {/* Premium back button */}
      <Link
        to={step === 1 ? "/login" : "#"}
        onClick={() => step === 2 && setStep(1)}
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
        <span style={{ fontSize: 13, fontWeight: 500, letterSpacing: "-0.01em" }}>Back</span>
      </Link>

      {/* Noise texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.035,
        }}
      />

      {/* Ambient glow blob */}
      <div
        className="pointer-events-none absolute z-0"
        style={{
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, #10b981 0%, transparent 70%)",
          opacity: 0.06,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          animation: "blobDrift 18s ease-in-out infinite",
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

      {/* Form card */}
      <motion.div
        animate={shake ? { x: [-4, 4, -3, 3, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-[400px]"
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          {/* Logo */}
          <div className="mb-12 text-center">
            <Link to="/" className="text-sm font-medium tracking-widest text-white/80 hover:text-white transition-colors">
              eAson.
            </Link>
          </div>

          {/* Heading */}
          <div className="mb-8">
            <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Reset Password</h1>
            <p className="text-sm text-white/40">
              {step === 1
                ? "Enter your email to receive a secure reset token."
                : "Enter the 6-digit token sent to your email and a new password."}
            </p>
          </div>

          {/* Step 1 Form */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">
                  Registered Email
                </label>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/40"
                />
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full mt-2 bg-white text-black font-medium text-sm rounded-lg py-2.5 hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  "Send Secure Token"
                )}
              </motion.button>
            </form>
          )}

          {/* Step 2 Form */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">
                  6-Digit OTP
                </label>
                <input
                  type="text"
                  placeholder="123456"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/40"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white placeholder:text-white/20 outline-none transition-colors focus:border-white/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.98 }}
                disabled={loading}
                className="w-full mt-2 bg-white text-black font-medium text-sm rounded-lg py-2.5 hover:bg-white/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  "Reset Password"
                )}
              </motion.button>
            </form>
          )}

          {/* Footer links */}
          <div className="mt-8 text-center space-y-3">
            <p className="text-[11px] text-white/20">
              Trusted by verified traders across Nepal
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
