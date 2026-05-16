import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, ArrowLeft, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import api from "../../utils/api";

export default function AcceptInvite() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [form, setForm] = useState({ firstName: "", lastName: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error("Invalid invite link.");
      navigate("/");
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.password) {
      return toast.error("Please fill all fields");
    }

    setLoading(true);
    try {
      await api.post("/company/accept-invite", {
        token,
        ...form
      });
      toast.success("Account created successfully!");
      navigate("/login");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to accept invite");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0a0a] flex items-center justify-center overflow-hidden px-4">
      <Link to="/" className="absolute top-6 left-6 z-20 flex items-center gap-2 text-white/40 hover:text-white/80 transition-all group" style={{ textDecoration: "none" }}>
        <span className="group-hover:border-white/20 group-hover:bg-white/8 flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md transition-all">
          <ArrowLeft size={14} />
        </span>
        <span className="text-[13px] font-medium tracking-tight">eAson</span>
      </Link>

      <div className="pointer-events-none absolute inset-0 z-0 opacity-[0.035]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
      <div className="pointer-events-none absolute z-0 w-[600px] h-[600px] rounded-full top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.06]" style={{ background: "radial-gradient(circle, #10b981 0%, transparent 70%)" }} />

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-[400px]">
        <div className="mb-12 text-center">
          <span className="text-sm font-medium tracking-widest text-white/80">eAson.</span>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white mb-2">Join Company</h1>
          <p className="text-sm text-white/40">Complete your profile to accept the invitation.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">First Name</label>
              <input type="text" value={form.firstName} onChange={(e) => setForm({...form, firstName: e.target.value})} className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/40" placeholder="John" />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">Last Name</label>
              <input type="text" value={form.lastName} onChange={(e) => setForm({...form, lastName: e.target.value})} className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-white/40" placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-white/40 uppercase tracking-widest mb-1.5">New Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} className="w-full bg-transparent border border-white/12 rounded-lg px-3.5 py-2.5 pr-10 text-sm text-white outline-none focus:border-white/40" placeholder="••••••••" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <motion.button whileTap={{ scale: 0.98 }} disabled={loading} type="submit" className="w-full mt-2 bg-white text-black font-medium text-sm rounded-lg py-2.5 hover:bg-white/90 transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Joining...</> : "Accept Invite & Join"}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
}
