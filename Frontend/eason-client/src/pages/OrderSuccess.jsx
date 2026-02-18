// src/pages/OrderSuccess.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const { state, search } = useLocation();
  const params = new URLSearchParams(search);
  const orderId = state?.orderId || params.get("orderId") || "ORD-TEST";
  const total = state?.total || 0;
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-lg p-10 bg-white rounded-2xl shadow-xl">
        <CheckCircle className="w-24 h-24 mx-auto text-emerald-600 mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for shopping with us.<br />
          Order ID: <strong>{orderId}</strong><br />
          {total > 0 && <>Total: <strong>Rs {total.toLocaleString()}</strong><br /></>}
          (Cash on Delivery – pay when your order arrives)
        </p>
        <p className="text-gray-500 mb-10">
          We'll notify you when your order is shipped.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate("/marketplace")}
            className="px-10 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
          >
            Continue Shopping
          </button>
          <button
            onClick={() => navigate("/orders")}
            className="px-10 py-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition"
          >
            View My Orders
          </button>
        </div>
      </div>
    </div>
  );
}