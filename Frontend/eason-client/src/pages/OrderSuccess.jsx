// src/pages/OrderSuccess.jsx
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const orderId = state?.orderId || "ORD-TEST";
  const total = state?.total || 0;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-lg p-10 bg-white rounded-2xl shadow-xl">
        <CheckCircle className="w-24 h-24 mx-auto text-emerald-600 mb-6" />
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Order Placed!</h1>
        <p className="text-xl text-gray-600 mb-8">
          Thank you for your purchase.<br />
          Order ID: <strong>{orderId}</strong><br />
          Total: <strong>Rs {total.toLocaleString()}</strong>
        </p>
        <p className="text-gray-500 mb-10">
          We'll notify you when your order ships.
        </p>
        <button
          onClick={() => navigate("/marketplace")}
          className="px-10 py-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}