// src/pages/retailer/Orders.jsx
import React, { useState, useEffect } from "react";
import API from "../../utils/api";
import toast from "react-hot-toast";
import {
  Package, ShoppingBag, ArrowLeft, Clock, CheckCircle,
  Truck, XCircle, AlertCircle, ChevronDown, ChevronUp, MapPin, Check
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const STATUS = {
  pending:    { label: "Pending",    icon: Clock,        color: "bg-amber-50 text-amber-600 border-amber-200"    },
  processing: { label: "Processing", icon: AlertCircle,  color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  shipped:    { label: "Shipped",    icon: Truck,        color: "bg-blue-50 text-blue-600 border-blue-200"       },
  delivered:  { label: "Delivered",  icon: CheckCircle,  color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  cancelled:  { label: "Cancelled",  icon: XCircle,      color: "bg-red-50 text-red-500 border-red-200"          },
};

function OrderCard({ order }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS[order.status] || STATUS.pending;
  const StatusIcon = status.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-6 py-5 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center shrink-0">
            <Package className="w-4.5 h-4.5 text-gray-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">
              #{order._id.slice(-8).toUpperCase()}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                day: "numeric", month: "short", year: "numeric",
              })} · {order.items?.length} item{order.items?.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-base font-bold text-gray-900">
              Rs {Number(order.totalAmount).toLocaleString()}
            </p>
            <span className={`inline-flex items-center gap-1.5 mt-1 text-[11px] font-semibold px-2.5 py-1 rounded-full border ${status.color}`}>
              <StatusIcon className="w-3 h-3" />
              {status.label}
            </span>
          </div>
          <div className="text-gray-400">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="border-t border-gray-100 px-6 py-5 space-y-5">
              {/* Items */}
              <div>
                <p className="text-[11px] text-gray-400 uppercase tracking-widest font-semibold mb-3">Items</p>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item._id} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-[#f5f5f5] rounded-xl overflow-hidden shrink-0">
                        {item.product?.image
                          ? <img
                              src={`http://localhost:5000${item.product.image}`}
                              alt={item.product.name}
                              className="w-full h-full object-contain p-1.5"
                            />
                          : <Package className="w-4 h-4 text-gray-400 m-auto" />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {item.product?.name || "Product"}
                        </p>
                        <p className="text-xs text-gray-400">
                          ×{item.quantity} · Rs {Number(item.pricePerUnit).toLocaleString()} each
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-gray-900 shrink-0">
                        Rs {Number(item.pricePerUnit * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Status Tracker */}
              {(() => {
                const steps = ["Ordered", "Processing", "Shipped", "Delivered"];
                const currentStep = { pending: 0, processing: 1, shipped: 2, delivered: 3 }[order.status] ?? 0;
                const isCancelled = order.status === "cancelled";

                return isCancelled ? (
                  <div className="bg-red-50 text-red-600 border border-red-100 rounded-xl px-4 py-4 flex items-center justify-center font-semibold text-sm">
                    <XCircle className="w-5 h-5 mr-2" /> Order cancelled
                  </div>
                ) : (
                  <div className="relative py-6 px-4 mb-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div className="absolute top-10 left-8 right-8 h-0.5 bg-gray-200 -z-10" />
                    <div className="absolute top-10 left-8 h-0.5 bg-emerald-500 -z-10 transition-all duration-500" style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }} />
                    <div className="flex justify-between relative z-10 w-full">
                      {steps.map((step, i) => (
                         <div key={step} className="flex flex-col items-center gap-2">
                           <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              i < currentStep ? "bg-emerald-500 text-white" : i === currentStep ? "bg-white border-2 border-emerald-500 text-emerald-500 shadow-sm" : "bg-white border-2 border-gray-200 text-gray-300"
                           }`}>
                             {i < currentStep && <Check className="w-4 h-4" />}
                             {i === currentStep && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                           </div>
                           <span className={`text-[11px] font-semibold text-center ${i <= currentStep ? "text-gray-900" : "text-gray-400"}`}>
                             {step}
                           </span>
                         </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Shipping */}
              <div className="bg-gray-50 rounded-xl px-4 py-4 flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 font-medium">Delivery address</p>
                  <p className="text-sm text-gray-700 mt-0.5">{order.shippingAddress || "—"}</p>
                  {order.phone && <p className="text-xs text-gray-400 mt-0.5">{order.phone}</p>}
                </div>
              </div>

              {/* Notes */}
              {order.notes && (
                <p className="text-xs text-gray-400 italic px-1">Note: {order.notes}</p>
              )}

              {/* Price breakdown */}
              <div className="pt-2 border-t border-gray-100 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>Subtotal</span>
                  <span>Rs {Number(order.totalAmount / 1.13).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                </div>
                <div className="flex justify-between text-gray-500">
                  <span>Tax (13%)</span>
                  <span>Rs {Number(order.totalAmount - order.totalAmount / 1.13).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}</span>
                </div>
                <div className="flex justify-between font-semibold text-gray-900 pt-1.5 border-t border-gray-100">
                  <span>Total paid</span>
                  <span>Rs {Number(order.totalAmount).toLocaleString()}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await API.get("/orders/my-orders");
        setOrders(res.data.orders || res.data || []);
      } catch {
        toast.error("Couldn't load your orders.");
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filtered = filter === "all" ? orders : orders.filter(o => o.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9]" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>
      {/* Minimal top bar */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-40">
        <div className="max-w-screen-lg mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition font-medium"
          >
            <ArrowLeft className="w-4 h-4" /> Marketplace
          </button>
          <Link to="/" className="text-base font-bold text-gray-900">
            eAson<span className="text-emerald-500">.</span>
          </Link>
          <span className="text-xs text-gray-400">{orders.length} order{orders.length !== 1 ? "s" : ""}</span>
        </div>
      </div>

      <div className="max-w-screen-lg mx-auto px-6 py-10">
        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold text-gray-900">My Orders</h1>
          <p className="text-sm text-gray-400 mt-1">Track, view and manage all your purchases.</p>
        </div>

        {/* Filter tabs */}
        {orders.length > 0 && (
          <div className="flex gap-2 mb-8 overflow-x-auto pb-1 scrollbar-hide">
            {["all", "pending", "processing", "shipped", "delivered", "cancelled"].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition ${
                  filter === f
                    ? "bg-black text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400"
                }`}
              >
                {f === "all" ? `All (${orders.length})` : `${STATUS[f]?.label ?? f} (${orders.filter(o => o.status === f).length})`}
              </button>
            ))}
          </div>
        )}

        {/* Orders list */}
        {filtered.length === 0 ? (
          <div className="bg-white border border-gray-100 rounded-3xl py-24 flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center">
              <ShoppingBag className="w-7 h-7 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {filter === "all" ? "No orders yet" : `No ${filter} orders`}
            </h2>
            <p className="text-sm text-gray-400 max-w-xs text-center">
              {filter === "all"
                ? "Place your first order and it'll show up here."
                : "Try a different filter."}
            </p>
            <button
              onClick={() => navigate("/marketplace")}
              className="mt-4 px-8 py-3.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition"
            >
              Shop Now
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(order => (
              <OrderCard key={order._id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}