// src/pages/OrderSuccess.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, ArrowRight, Package, Truck, Home, CheckCircle, MessageCircle } from "lucide-react";

const FONT = { fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" };

const timelineSteps = [
  { icon: Check,         label: "Order Placed",  sub: "Right now",         active: true  },
  { icon: Package,       label: "Processing",    sub: "Within 1 hour",     active: false },
  { icon: Truck,         label: "Shipped",       sub: "1–2 days",          active: false },
  { icon: Home,          label: "Delivered",     sub: "2–3 days",          active: false },
];

export default function OrderSuccess() {
  const { state, search } = useLocation();
  const params  = new URLSearchParams(search);
  const orderId = state?.orderId || params.get("orderId") || "ORD-TEST";
  const total   = state?.total || 0;
  const navigate = useNavigate();
  const shortId = typeof orderId === "string" ? orderId.slice(-8).toUpperCase() : orderId;

  return (
    <div className="min-h-screen bg-white" style={FONT}>
      {/* Top stripe */}
      <div className="h-1.5 bg-emerald-500 w-full" />

      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        {/* Check mark */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-8 shadow-lg shadow-emerald-100"
        >
          <Check className="w-10 h-10 text-white" strokeWidth={3} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-black mb-3 uppercase">
            Order Confirmed.
          </h1>
          <p className="text-gray-400 text-sm mb-2">Thank you for your purchase.</p>
          <div className="inline-flex items-center gap-2 bg-gray-50 border border-gray-100 rounded-full px-4 py-2 mt-1 mb-1">
            <span className="text-xs text-gray-400 font-medium uppercase tracking-widest">Order ID</span>
            <span className="text-sm font-bold text-black">{shortId}</span>
          </div>
          {total > 0 && (
            <p className="text-sm font-semibold text-black mt-2">
              Total Paid: <span className="text-emerald-600">Rs {total.toLocaleString()}</span>
            </p>
          )}
        </motion.div>

        {/* ── Order Timeline ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-14 relative"
        >
          <div className="flex items-start justify-between relative">
            {/* Dashed connecting line */}
            <div className="absolute top-6 left-0 right-0 flex px-8 md:px-12">
              {[0, 1, 2].map(i => (
                <div key={i} className={`flex-1 h-px mx-2 ${i === 0 ? "bg-emerald-500" : "border-t-2 border-dashed border-gray-200"}`} />
              ))}
            </div>

            {timelineSteps.map(({ icon: Icon, label, sub, active }, i) => (
              <div key={label} className="flex flex-col items-center gap-2 flex-1 z-10">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all ${
                  active
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100"
                    : "bg-white border-gray-200 text-gray-300"
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <p className={`text-xs font-bold uppercase tracking-wide leading-tight ${active ? "text-black" : "text-gray-400"}`}>
                  {label}
                </p>
                <p className="text-[11px] text-gray-400">{sub}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── What happens next? ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-left bg-gray-50 border border-gray-100 rounded-2xl p-6"
        >
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-4">What happens next?</p>
          <div className="space-y-3">
            {[
              "We confirm your order within 1 hour",
              "Your wholesaler prepares the package",
              "Delivery arrives in 2–3 days",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                <p className="text-sm text-gray-600">{text}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── Action Buttons ───────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex flex-col sm:flex-row gap-3 justify-center mt-10"
        >
          <button
            onClick={() => navigate("/marketplace")}
            className="px-8 py-4 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-900 transition flex items-center justify-center gap-2"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => window.location.href = "/profile"}
            className="px-8 py-4 border border-gray-200 text-black text-xs font-bold uppercase tracking-widest hover:border-black transition"
          >
            View My Orders
          </button>
        </motion.div>

        {/* ── WhatsApp CTA ─────────────────────────────────────────── */}
        <motion.a
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          href="https://wa.me/9779800000000"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-sm text-gray-400 hover:text-emerald-600 transition group"
        >
          <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          Questions? Chat with us on WhatsApp
        </motion.a>
      </div>
    </div>
  );
}