// src/pages/wholesaler/WholesalerDashboard.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Package, TrendingUp, ShoppingBag, Plus, Eye, MessageCircle,
  BarChart3, ArrowRight, Store, CheckCircle, Clock, AlertCircle,
  LogOut, Settings, Search, ShoppingCart
} from "lucide-react";
import API from "../../utils/api";
import { useAuthStore } from "../../store/authStore";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast";

const FONT = { fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" };

function StatCard({ icon: Icon, label, value, sub, color = "emerald" }) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600",
    indigo:  "bg-indigo-50 text-indigo-600",
    amber:   "bg-amber-50 text-amber-600",
    rose:    "bg-rose-50 text-rose-600",
  };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-md transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${colors[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

export default function WholesalerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { cartCount } = useCart();

  const [myProducts, setMyProducts] = useState([]);
  const [orders, setOrders]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("overview"); // overview | products | orders | browse

  useEffect(() => {
    const load = async () => {
      try {
        const [prodRes, orderRes] = await Promise.all([
          API.get("/products/my"),
          API.get("/orders/wholesaler"),
        ]);
        setMyProducts(prodRes.data || []);
        setOrders(orderRes.data || []);
      } catch {
        // silently fail — endpoints may not exist yet
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const totalStock  = myProducts.reduce((s, p) => s + (p.stock || 0), 0);
  const totalOrders = orders.length;
  const pending     = orders.filter(o => o.status === "pending").length;

  if (!user?.verified) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center" style={FONT}>
        <div className="max-w-md text-center p-8">
          <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Clock className="w-7 h-7 text-amber-500" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Awaiting verification</h2>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your wholesaler account is under review by our team. You'll get notified once approved (usually within 24–48 hours).
          </p>
          <button
            onClick={() => navigate("/marketplace")}
            className="mt-8 px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
          >
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={FONT}>
      {/* ── Sidebar + main layout ── */}
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-gray-100 flex flex-col p-5 fixed top-0 left-0 h-full z-40 hidden lg:flex">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight mb-10 mt-2 block">
            eAson<span className="text-emerald-400">.</span>
          </Link>

          <nav className="flex-1 space-y-1">
            {[
              { id: "overview",  icon: BarChart3,    label: "Overview" },
              { id: "products",  icon: Package,      label: "My Products" },
              { id: "orders",    icon: ShoppingBag,  label: "Orders" },
              { id: "browse",    icon: Store,        label: "Browse Market" },
            ].map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  activeTab === id
                    ? "bg-black text-white"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </nav>

          <div className="space-y-2 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate("/settings")}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-gray-500 hover:bg-gray-50 hover:text-gray-900 transition"
            >
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-500 hover:bg-red-50 transition"
            >
              <LogOut className="w-4 h-4" /> Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 lg:ml-60 p-6 lg:p-10">

          {/* Top bar */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                {activeTab === "overview" && "Overview"}
                {activeTab === "products" && "My Products"}
                {activeTab === "orders"   && "Orders"}
                {activeTab === "browse"   && "Browse Marketplace"}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Welcome back, {user?.firstName}</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 text-gray-500 hover:text-black transition"
              >
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate("/add-product")}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          {/* ──── OVERVIEW ──── */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Package}    label="Products listed"  value={myProducts.length}  color="emerald" />
                <StatCard icon={ShoppingBag} label="Total orders"    value={totalOrders}         color="indigo"  />
                <StatCard icon={TrendingUp}  label="Total stock"     value={totalStock}          color="amber"   />
                <StatCard icon={AlertCircle} label="Pending orders"  value={pending}             color="rose"    />
              </div>

              {/* Quick actions */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-base font-semibold text-gray-800 mb-4">Quick actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "Add product",       icon: Plus,          action: () => navigate("/add-product") },
                    { label: "View my products",  icon: Eye,           action: () => setActiveTab("products") },
                    { label: "Check orders",      icon: ShoppingBag,   action: () => setActiveTab("orders") },
                    { label: "Order Kanban",      icon: BarChart3,     action: () => navigate("/orders/kanban") },
                  ].map(({ label, icon: Icon, action }) => (
                    <button
                      key={label}
                      onClick={action}
                      className="flex flex-col items-center gap-2 p-4 border border-gray-100 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition"
                    >
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-xs font-medium text-gray-600 text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Recent products */}
              {myProducts.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-base font-semibold text-gray-800">Recent Products</h2>
                    <button onClick={() => setActiveTab("products")} className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      View all <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {myProducts.slice(0, 4).map(p => (
                      <div key={p._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition">
                        <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                          {p.image
                            ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-contain p-1" />
                            : <div className="w-full h-full flex items-center justify-center"><Package className="w-5 h-5 text-gray-400" /></div>
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.category?.name || "General"} · {p.stock ?? "—"} in stock</p>
                        </div>
                        <span className="text-sm font-semibold text-gray-900 shrink-0">
                          Rs {Number(p.priceInfo?.sellingPrice || p.wholesalerPrice || p.price || 0).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ──── MY PRODUCTS ──── */}
          {activeTab === "products" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : myProducts.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm mb-6">You haven't listed any products yet.</p>
                  <button
                    onClick={() => navigate("/add-product")}
                    className="px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
                  >
                    Add your first product
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-100">
                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Product</th>
                        <th className="text-left py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Category</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Stock</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                        <th className="text-right py-3 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {myProducts.map(p => (
                        <tr
                          key={p._id}
                          className="hover:bg-gray-50 transition cursor-pointer"
                          onClick={() => navigate(`/marketplace/product/${p._id}`)}
                        >
                          <td className="py-4 px-2">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                {p.image
                                  ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-contain p-1" />
                                  : <Package className="w-5 h-5 text-gray-400 m-auto" />
                                }
                              </div>
                              <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-2 text-gray-500">{p.category?.name || "—"}</td>
                          <td className="py-4 px-2 text-right">
                            <span className={`font-semibold ${p.stock <= 5 ? "text-red-500" : "text-gray-900"}`}>
                              {p.stock ?? "—"}
                            </span>
                          </td>
                          <td className="py-4 px-2 text-right font-semibold text-gray-900">
                            Rs {Number(p.priceInfo?.sellingPrice || p.wholesalerPrice || p.price || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-2 text-right">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${p.stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                              {p.stock > 0 ? "In Stock" : "Sold Out"}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ──── ORDERS ──── */}
          {activeTab === "orders" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-6">
              {loading ? (
                <div className="flex justify-center py-16">
                  <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-20">
                  <ShoppingBag className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                  <p className="text-gray-500 text-sm">No orders received yet.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order._id} className="flex items-start gap-4 p-4 border border-gray-100 rounded-2xl hover:border-gray-200 transition">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900">#{order._id?.slice(-6).toUpperCase()}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            order.status === "pending" ? "bg-amber-50 text-amber-600" :
                            order.status === "delivered" ? "bg-emerald-50 text-emerald-600" :
                            "bg-gray-100 text-gray-600"
                          }`}>{order.status}</span>
                        </div>
                        <p className="text-xs text-gray-400">
                          {order.buyer?.firstName} {order.buyer?.lastName} · {order.items?.length} item(s)
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                          Rs {Number(order.total || 0).toLocaleString()}
                        </p>
                        <button
                          onClick={() => alert("Chat module coming soon — you'll be able to message the buyer here.")}
                          className="mt-2 flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 font-medium"
                        >
                          <MessageCircle className="w-3.5 h-3.5" />
                          Message buyer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ──── BROWSE ──── */}
          {activeTab === "browse" && (
            <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center">
              <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Store className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Browse products from other wholesalers</h3>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-8 leading-relaxed">
                As a wholesaler you can purchase products listed by <strong>other wholesalers</strong> at your special price. Your own products are excluded from your cart.
              </p>
              <button
                onClick={() => navigate("/marketplace")}
                className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition"
              >
                Open Marketplace <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
