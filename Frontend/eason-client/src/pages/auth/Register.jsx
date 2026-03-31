// src/pages/auth/Register.jsx
import React, { useState, Suspense, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, Loader2, ArrowRight, Check, Mail } from "lucide-react";
import API from "../../utils/api.js";
import { useAuthStore } from "../../store/authStore";
import { motion, AnimatePresence } from "framer-motion";
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
  </Canvas>
);

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full bg-white/5 border border-white/20 text-white placeholder-white/30 text-sm px-4 py-4 rounded-none focus:outline-none focus:border-white focus:ring-1 focus:ring-white transition-colors duration-300";

const Register = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState("");
  const [formData, setFormData] = useState({
    fname: "", lname: "", email: "", password: "", confirmPassword: "", role: "retailer",
  });
  
  // New States for OTP Flow
  const [step, setStep] = useState(1);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError("Passwords don't match");
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/register", {
        firstName: formData.fname,
        lastName: formData.lname,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });
      // Switch to validation step
      setRegisteredEmail(formData.email);
      setStep(2);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return setError("Enter a valid 6-digit code.");
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/verify-email", { email: registeredEmail, otp });
      
      if (res.data.token && res.data.user) {
        // Auto-login!
        localStorage.setItem("eason_token", res.data.token);
        login(res.data.user);
        
        // Redirect based on role
        if (res.data.user.role === "admin") navigate("/dashboard");
        else if (res.data.user.role === "wholesaler") navigate("/profile");
        else navigate("/marketplace");
      } else {
        navigate("/login", { state: { message: "Email verified successfully! Please log in." }});
      }
    } catch (err) {
      setError(err.response?.data?.message || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setResendLoading(true);
    setError("");
    try {
      await API.post("/auth/resend-otp", { email: registeredEmail });
      setResendCooldown(60); // 1 minute cooldown
      setError("A new code has been sent.");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to resend code.");
    } finally {
      setResendLoading(false);
    }
  };

  const strength = formData.password.length >= 8 && /[A-Z]/.test(formData.password) && /[0-9]/.test(formData.password);

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
            Wholesale,<br />
            <span className="text-emerald-400 font-semibold">without the chaos.</span>
          </h1>
          <p className="mt-4 text-white/40 text-sm leading-relaxed max-w-xs">
            Join 8,000+ Nepali traders who order wholesale in seconds — no market trips, no middlemen.
          </p>
          <div className="mt-8 flex items-center gap-4">
            {["No fees", "Cancel anytime", "Instant access"].map(t => (
              <div key={t} className="flex items-center gap-1.5 text-xs text-white/40">
                <Check className="w-3.5 h-3.5 text-emerald-400" /> {t}
              </div>
            ))}
          </div>
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
          {/* Logo */}
          <Link to="/" className="inline-block text-xl font-bold tracking-widest uppercase text-white mb-12">
            eAson<span className="text-white">.</span>
          </Link>

          {step === 1 ? (
            <>
              <h2 className="text-4xl font-bold tracking-tighter text-white mb-2">Create account</h2>
              <p className="text-white/50 text-sm mb-12 uppercase tracking-widest font-bold">
                Already have one?{" "}
                <Link to="/login" className="text-white hover:text-gray-300 transition-colors">
                  Sign in
                </Link>
              </p>

              {/* Role toggle */}
              <div className="flex border border-white/20 mb-10">
                {["retailer", "wholesaler"].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setFormData({ ...formData, role: r })}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                      formData.role === r
                        ? "bg-white text-black"
                        : "text-white/50 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-3 mb-6 relative">
                <div className="w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center">
                  <Mail className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
              <h2 className="text-4xl font-bold tracking-tighter text-white mb-2">Verify email</h2>
              <p className="text-white/50 text-sm mb-10 leading-relaxed">
                We've sent a 6-digit verification code to <span className="text-white font-medium">{registeredEmail}</span>.
              </p>
            </>
          )}

          {step === 1 ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="First name">
                  <input name="fname" value={formData.fname} onChange={handleChange}
                    placeholder="Aarav" required autoComplete="given-name"
                    className={inputCls} />
                </Field>
                <Field label="Last name">
                  <input name="lname" value={formData.lname} onChange={handleChange}
                    placeholder="Thapa" required autoComplete="family-name"
                    className={inputCls} />
                </Field>
              </div>

              <Field label="Email">
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="aarav@example.com" required autoComplete="email"
                  className={inputCls} />
              </Field>

              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min. 8 characters"
                    required
                    className={`${inputCls} pr-11`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-3.5 text-white/30 hover:text-white/60 transition">
                    {showPass ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
                {formData.password.length > 0 && (
                  <div className={`mt-1.5 text-[11px] font-medium ${strength ? "text-emerald-400" : "text-amber-400"}`}>
                    {strength ? "✓ Strong password" : "Use 8+ chars, a number, and uppercase"}
                  </div>
                )}
              </Field>

              <Field label="Confirm password">
                <div className="relative">
                  <input
                    type={showConfirm ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    required
                    className={`${inputCls} pr-11`}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3.5 top-3.5 text-white/30 hover:text-white/60 transition">
                    {showConfirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                  </button>
                </div>
              </Field>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-xs px-4 py-4 uppercase tracking-widest font-bold text-center ${
                      error.includes("sent") 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
                        : "bg-red-600 border border-red-500 text-white"
                    }`}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-white text-black font-bold uppercase tracking-widest hover:bg-gray-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 mt-6 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Creating account..." : "Create Account"}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </motion.button>
            </form>
          ) : (
            <form onSubmit={handleVerify} className="space-y-6">
              <Field label="6-Digit Verification Code">
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="000000"
                  required
                  className={`${inputCls} text-center text-3xl tracking-[0.5em] font-mono py-6 placeholder:text-white/10`}
                />
              </Field>

              <AnimatePresence>
                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`text-xs px-4 py-4 uppercase tracking-widest font-bold text-center ${
                      error.includes("sent") 
                        ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" 
                        : "bg-red-600 border border-red-500 text-white"
                    }`}
                  >
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <motion.button
                type="submit"
                disabled={loading || otp.length < 6}
                whileTap={{ scale: 0.98 }}
                className="w-full py-5 bg-emerald-500 text-black font-bold uppercase tracking-widest hover:bg-emerald-400 disabled:opacity-60 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-3 text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Verifying..." : "Verify & Continue"}
                {!loading && <Check className="w-5 h-5" />}
              </motion.button>

              <div className="text-center pt-4">
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendLoading || resendCooldown > 0}
                  className="text-white/40 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {resendLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                  {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Didn't receive code? Resend"}
                </button>
              </div>
            </form>
          )}

          <p className="mt-8 text-center text-white/20 text-xs">
            By signing up you agree to our{" "}
            <a href="#" className="text-white/40 hover:text-white transition">Terms</a> and{" "}
            <a href="#" className="text-white/40 hover:text-white transition">Privacy Policy</a>.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;