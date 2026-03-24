// src/pages/OrderSuccess.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Check, ArrowRight } from "lucide-react";

export default function OrderSuccess() {
  const { state, search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = state?.orderId || params.get("orderId") || "ORD-TEST";
  const total = state?.total || 0;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-white" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="text-center w-full max-w-2xl px-6 py-20 border-t-4 border-black">
        <div className="w-20 h-20 bg-black text-white rounded-none flex items-center justify-center mx-auto mb-10">
          <Check className="w-10 h-10" />
        </div>
        
        <h1 className="text-5xl font-bold tracking-tighter text-black mb-6 uppercase">Order Confirmed.</h1>
        
        <div className="space-y-2 mb-12 text-sm uppercase tracking-widest font-bold text-gray-400">
          <p>Thank you for your purchase.</p>
          <p>Order ID: <span className="text-black">{orderId}</span></p>
          {total > 0 && <p>Total: <span className="text-black">Rs {total.toLocaleString()}</span></p>}
          <p className="mt-4 text-xs">Cash on Delivery applies.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
          <button
            onClick={() => navigate("/marketplace")}
            className="px-8 py-5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors flex items-center justify-center gap-3"
          >
            Continue Shopping <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="px-8 py-5 bg-white text-black border border-gray-200 text-xs font-bold uppercase tracking-widest hover:border-black transition-colors"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
}