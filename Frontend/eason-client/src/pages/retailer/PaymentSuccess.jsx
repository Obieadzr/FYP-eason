// src/pages/retailer/PaymentSuccess.jsx
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import API from "../../utils/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState("verifying"); // verifying, success, error
  const [message, setMessage] = useState("Verifying your payment with Khalti...");
  const [orderId, setOrderId] = useState(null);

  useEffect(() => {
    const pidx = searchParams.get("pidx");
    const purchase_order_id = searchParams.get("purchase_order_id");
    
    if (purchase_order_id) setOrderId(purchase_order_id);

    if (!pidx || !purchase_order_id) {
      setStatus("error");
      setMessage("Invalid payment callback parameters.");
      return;
    }

    const verifyPayment = async () => {
      try {
        await API.post("/payment/khalti/verify", { pidx, orderId: purchase_order_id });
        setStatus("success");
        setMessage("Payment successful! Your order has been placed.");
        setTimeout(() => {
          window.location.href = `/order-success?orderId=${purchase_order_id}`;
        }, 2000);
      } catch (err) {
        console.error("Payment Verification Failed", err);
        setStatus("error");
        setMessage(err.response?.data?.message || "Payment verification failed. Please contact support.");
      }
    };

    verifyPayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex flex-col items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-sm text-center">
        {status === "verifying" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
            <h2 className="text-xl font-semibold text-gray-900">Verifying Payment</h2>
            <p className="text-sm text-gray-500">{message}</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
            <h2 className="text-xl font-bold text-gray-900">Payment Verified!</h2>
            <p className="text-sm text-gray-500">Redirecting to your order receipt...</p>
            <button 
              onClick={() => window.location.href = "/profile"} 
              className="mt-4 w-full py-3 bg-black text-white rounded-xl font-semibold uppercase tracking-widest text-xs hover:bg-gray-900 transition"
            >
              View Orders
            </button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <XCircle className="w-16 h-16 text-red-500" />
            <h2 className="text-xl font-bold text-gray-900">Payment Failed</h2>
            <p className="text-sm text-gray-500">{message}</p>
            <div className="mt-4 flex gap-3 w-full">
              <Link to="/cart" className="flex-1 py-3 bg-gray-100 text-black font-semibold rounded-xl hover:bg-gray-200 transition">
                Return to Cart
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
