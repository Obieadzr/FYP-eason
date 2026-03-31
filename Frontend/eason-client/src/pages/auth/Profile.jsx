// src/pages/auth/Profile.jsx
import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, TrendingUp, Settings,
  LogOut, CheckCircle2, Boxes, AlertTriangle, ShoppingBag,
  Search, Plus, Edit3, Trash2, Loader2, Download, MessageCircle,
  Image, DollarSign, Clock, Store, Truck, X, XCircle
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import API from "../../utils/api";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";
import { useCart } from "../../context/CartContext";
import { useChat } from "../../store/useChat";
import { generateInvoice } from "../../utils/generateInvoice";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const FONT = { fontFamily: "'Satoshi', sans-serif" };

function StatCard({ icon: Icon, label, value, alert }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${alert ? "bg-amber-50 text-amber-500" : "bg-emerald-50 text-emerald-600"}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <h3 className={`text-3xl font-bold ${alert ? "text-amber-600" : "text-gray-900"}`}>{value}</h3>
        <p className="text-sm text-gray-500 mt-1">{label}</p>
      </div>
    </div>
  );
}

/* ─── Edit/Add Product Modal ──────────────────────────────────────────── */
function ProductModal({ product, categories, onClose, onSave }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name:        product?.name        || "",
    description: product?.description || "",
    price:       product?.price       || product?.wholesalerPrice || "",
    stock:       product?.stock       || "",
    category:    product?.category?._id || product?.category || "",
    image:       null,
    bulkPricing: product?.bulkPricing || [],
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(
    product?.image ? `http://localhost:5000${product.image}` : null
  );

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) {
      setForm({ ...form, image: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { 
        if (v !== null && v !== "") {
          if (k === "bulkPricing") {
             fd.append(k, JSON.stringify(v));
          } else {
             fd.append(k, v);
          }
        } 
      });
      if (isEdit) {
        await API.put(`/products/${product._id}`, fd);
        toast.success("Product updated!");
      } else {
        await API.post("/products", fd);
        toast.success("Product added!");
      }
      onSave();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed.");
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition";

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl"
        style={FONT}
      >
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Image upload */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Product Image</label>
            <label className="block cursor-pointer">
              <div className={`h-40 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${preview ? "border-transparent" : "border-gray-200 hover:border-emerald-400"}`}>
                {preview
                  ? <img src={preview} alt="preview" className="w-full h-full object-contain p-2" />
                  : <div className="text-center">
                      <Image className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-xs text-gray-400">Click to upload image</p>
                    </div>
                }
              </div>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Product Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Surf Excel 4L" className={inputCls} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Description</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Short product description..." className={`${inputCls} resize-none`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Price (Rs) *</label>
              <input required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="2500" className={inputCls} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Stock *</label>
              <input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="100" className={inputCls} />
            </div>
          </div>

          {categories.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
                <option value="">Select category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
          )}

          {/* Tiered Pricing Section */}
          <div className="border border-gray-100 rounded-2xl p-4 bg-gray-50/50">
            <div className="flex items-center justify-between mb-3">
              <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider">Bulk Pricing Tiers (Optional)</label>
              <button 
                type="button" 
                onClick={() => setForm({ ...form, bulkPricing: [...form.bulkPricing, { minQuantity: "", pricePerUnit: "" }] })}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="w-3 h-3" /> Add Tier
              </button>
            </div>
            {form.bulkPricing.map((tier, index) => (
              <div key={index} className="flex gap-3 mb-3 items-center">
                <input 
                  type="number" 
                  min="2" 
                  placeholder="Min Qty (e.g. 100)" 
                  value={tier.minQuantity} 
                  onChange={e => {
                    const newTiers = [...form.bulkPricing];
                    newTiers[index].minQuantity = Number(e.target.value);
                    setForm({ ...form, bulkPricing: newTiers });
                  }} 
                  className={inputCls} 
                />
                <input 
                  type="number" 
                  placeholder="Price (e.g. 2300)" 
                  value={tier.pricePerUnit} 
                  onChange={e => {
                    const newTiers = [...form.bulkPricing];
                    newTiers[index].pricePerUnit = Number(e.target.value);
                    setForm({ ...form, bulkPricing: newTiers });
                  }} 
                  className={inputCls} 
                />
                <button 
                  type="button" 
                  onClick={() => setForm({ ...form, bulkPricing: form.bulkPricing.filter((_, i) => i !== index) })}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {form.bulkPricing.length === 0 && (
              <p className="text-xs text-gray-400 text-center py-2">No bulk tiers set. Click 'Add Tier' to set volume discounts.</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={loading}
            whileTap={{ scale: 0.98 }}
            className="w-full py-4 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "Saving..." : isEdit ? "Update Product" : "Add Product"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState("overview"); 
  const isWholesaler = user?.role === "wholesaler";

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [modal, setModal] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const { addToCart } = useCart();
  const { startChat } = useChat();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const load = async () => {
      try {
        const [orderRes, catRes, walletRes] = await Promise.all([
          API.get(isWholesaler ? "/orders/wholesaler" : "/orders/my-orders").catch(() => ({ data: [] })),
          API.get("/categories").catch(() => ({ data: [] })),
          API.get("/payment/wallet").catch(() => ({ data: { wallet: null } }))
        ]);
        setOrders(orderRes.data?.orders || orderRes.data || []);
        setCategories(catRes.data || []);
        setWallet(walletRes.data?.wallet || null);
        
        if (isWholesaler) {
          const prodRes = await API.get("/products/my").catch(() => ({ data: [] }));
          setProducts(prodRes.data.products || prodRes.data || []);
        }
      } finally { setLoading(false); }
    };
    if (user.role) load();
  }, [user, isWholesaler, navigate]);

  useEffect(() => {
    if (user && !isWholesaler && tab === "overview") setTab("orders");
  }, [user, isWholesaler, tab]);

  const handleDelete = async id => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await API.delete(`/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success("Product deleted successfully");
    } catch { toast.error("Could not delete product"); }
    finally { setDeleting(null); }
  };

  const handleMarkAsSent = async (id) => {
    try {
      await API.put(`/orders/${id}/status`, { status: "shipped" });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "shipped" } : o));
      toast.success("Order marked as sent!");
    } catch {
      toast.error("Failed to update status.");
    }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await API.put(`/orders/${id}/status`, { status: "cancelled" });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "cancelled" } : o));
      toast.success("Order cancelled successfully");
    } catch {
      toast.error("Failed to cancel order.");
    }
  };

  const handleReorder = (order) => {
    let successCount = 0;
    order.items?.forEach(item => {
      if (item.product && typeof item.product === 'object') {
        addToCart(item.product, item.quantity, {});
        successCount++;
      }
    });
    if (successCount > 0) {
      toast.success(`Items added to cart!`);
      navigate("/cart");
    }
  };

  const tabs = isWholesaler
    ? [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "products", label: "Products", icon: Package },
        { id: "orders", label: "Sales", icon: TrendingUp },
        { id: "wallet", label: "eAson Wallet", icon: DollarSign },
        { id: "settings", label: "Settings", icon: Settings }
      ]
    : [
        { id: "orders", label: "My Orders", icon: ShoppingBag },
        { id: "settings", label: "Settings", icon: Settings }
      ];

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  
  // Stats calculation
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const lowStockItems = products.filter(p => (p.stock || 0) < 10 && (p.stock || 0) > 0).length;
  
  const currentMonth = new Date().getMonth();
  const ordersThisMonth = orders.filter(o => new Date(o.createdAt).getMonth() === currentMonth).length;

  const revenueData = useMemo(() => {
    const grouped = {};
    const msInDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    for(let i=6; i>=0; i--) {
      const d = new Date(now.getTime() - i * msInDay);
      grouped[d.toLocaleDateString("en-US", { month: "short", day: "numeric" })] = 0;
    }
    orders.forEach(o => {
      if (o.status === "cancelled") return;
      const d = new Date(o.createdAt);
      const diffDays = Math.floor((now - d) / msInDay);
      if (diffDays <= 6) {
         const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
         if (grouped[dateStr] !== undefined) {
           grouped[dateStr] += (o.totalAmount || 0);
         }
      }
    });
    return Object.keys(grouped).map(date => ({ name: date, Revenue: grouped[date] }));
  }, [orders]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent flex rounded-full animate-spin" />
      </div>
    );
  }

  if (isWholesaler && !user?.verified) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center" style={FONT}>
        <div className="max-w-sm text-center p-8">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Awaiting verification</h2>
          <p className="text-sm text-gray-500 leading-relaxed">Your wholesaler account is being reviewed. Usually takes 24–48 hours.</p>
          <button onClick={() => navigate("/marketplace")} className="mt-7 px-7 py-3.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition flex items-center justify-center mx-auto gap-2">
            <Store className="w-4 h-4" /> Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  const fullName = user.fullName || `${user.firstName} ${user.lastName}`.trim();
  const initial = fullName ? fullName[0].toUpperCase() : "U";

  const getStatusBadge = (status) => {
    const s = {
      pending: "bg-amber-100 text-amber-700",
      processing: "bg-blue-100 text-blue-700",
      shipped: "bg-teal-100 text-teal-700",
      delivered: "bg-emerald-100 text-emerald-700",
      cancelled: "bg-rose-100 text-rose-700"
    }[status] || "bg-gray-100 text-gray-700";
    return <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${s}`}>{status}</span>;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20" style={FONT}>
      <Navbar />

      <div className="max-w-screen-2xl mx-auto flex flex-col lg:flex-row min-h-screen pt-24 px-4 sm:px-6">
        
        {/* LEFT SIDEBAR */}
        <aside className="w-full lg:w-72 shrink-0 mb-8 lg:mb-0 lg:fixed lg:h-[calc(100vh-8rem)]">
          <div className="bg-white/90 backdrop-blur-xl border-r border-white/50 shadow-lg rounded-2xl h-full flex flex-col">
            <div className="p-6 text-center border-b border-gray-100">
              <div className="relative mx-auto mt-2 w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-200">
                {initial}
                {isWholesaler && (
                  <div className="w-4 h-4 bg-emerald-500 border-2 border-white rounded-full absolute bottom-1 right-1" />
                )}
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">{fullName}</h2>
              <p className="text-sm text-gray-500 mb-3">{user.email}</p>
              
              {isWholesaler && (
                <div className="inline-flex items-center gap-1.5 bg-emerald-100 text-emerald-700 text-xs font-semibold px-3 py-1 rounded-full">
                  <CheckCircle2 className="w-4 h-4" /> Verified Supplier
                </div>
              )}
            </div>

            <nav className="flex-1 py-4">
              {tabs.map(t => (
                <motion.button
                  key={t.id}
                  whileHover={{ x: 4 }}
                  onClick={() => setTab(t.id)}
                  className={`w-[calc(100%-24px)] flex items-center gap-3 px-4 py-3 mx-3 font-medium text-sm transition-all ${
                    tab === t.id
                      ? "bg-emerald-600 text-white rounded-xl shadow-md shadow-emerald-200"
                      : "text-gray-600 hover:bg-gray-100 rounded-xl"
                  }`}
                >
                  <t.icon className="w-5 h-5" />
                  {t.label}
                </motion.button>
              ))}
            </nav>
          </div>
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 lg:ml-80 pb-16">
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
            >
              
              {/* OVERVIEW TAB */}
              {tab === "overview" && isWholesaler && (
                <div className="space-y-8">
                  <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                  
                  {lowStockItems > 0 && (
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between shadow-sm">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
                          <AlertTriangle className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="font-bold text-amber-900">Smart Restock Alert</h3>
                          <p className="text-sm text-amber-700">You have {lowStockItems} product(s) running low on stock. Consider restocking soon to avoid losing sales.</p>
                        </div>
                      </div>
                      <button onClick={() => setTab("products")} className="px-5 py-2.5 bg-amber-600 text-white text-sm font-bold rounded-xl hover:bg-amber-700 transition whitespace-nowrap">
                        Review Stock
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Package} label="Total Products" value={products.length} />
                    <StatCard icon={Boxes} label="Total Stock" value={totalStock} />
                    <StatCard icon={ShoppingBag} label="Orders This Month" value={ordersThisMonth} />
                    <StatCard icon={AlertTriangle} label="Low Stock Items" value={lowStockItems} alert={lowStockItems > 0} />
                  </div>

                  {/* Revenue Chart */}
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h2 className="text-sm font-semibold text-gray-900 mb-6">Revenue Over Time (Last 7 Days)</h2>
                    <div className="w-full h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                          <defs>
                            <linearGradient id="colorRevs" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dy={10} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={(val) => `Rs${val}`} dx={-10} />
                          <Tooltip 
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value) => [`Rs ${value.toLocaleString()}`, "Revenue"]}
                          />
                          <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevs)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    <div className="px-6 py-5 border-b border-gray-100">
                      <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                    </div>
                    {orders.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 text-sm">No recent activity</div>
                    ) : (
                      <div className="divide-y divide-gray-50">
                        {orders.slice(0, 3).map(o => (
                          <div key={o._id} className="p-6 flex items-center justify-between hover:bg-gray-50 transition">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">Order #{o._id?.slice(-8).toUpperCase()}</p>
                                <p className="text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                              <p className="font-bold text-gray-900">Rs {Number(o.totalAmount || o.total || 0).toLocaleString()}</p>
                              {getStatusBadge(o.status)}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* PRODUCTS TAB */}
              {tab === "products" && isWholesaler && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="relative flex-1 sm:w-64">
                        <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          value={search}
                          onChange={e => setSearch(e.target.value)}
                          placeholder="Search products..."
                          className="w-full bg-white border border-gray-200 text-gray-900 placeholder-gray-400 text-sm rounded-xl pl-11 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors shadow-sm"
                        />
                      </div>
                      <button
                        onClick={() => setModal({ mode: "add" })}
                        className="bg-emerald-600 text-white px-5 py-2.5 text-sm font-semibold rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm shadow-emerald-200 shrink-0"
                      >
                        <Plus className="w-4 h-4" /> Add Product
                      </button>
                    </div>
                  </div>

                  {filteredProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <div className="w-24 h-24 rounded-3xl bg-emerald-50 flex items-center justify-center mb-6">
                        <Package className="w-12 h-12 text-emerald-500" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900">No products yet</h2>
                      <p className="text-gray-500 max-w-xs mx-auto mt-2">Add your first product and start selling to retailers across Kathmandu</p>
                      <button
                        onClick={() => setModal({ mode: "add" })}
                        className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold hover:bg-emerald-700 mt-8 flex items-center gap-2 transition shadow-lg shadow-emerald-200"
                      >
                        <Plus className="w-5 h-5" /> Add Your First Product
                      </button>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Stock</th>
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {filteredProducts.map(p => (
                              <tr key={p._id} className="hover:bg-gray-50 transition">
                                <td className="py-4 px-6">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                      {p.image ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-300" />}
                                    </div>
                                    <div className="min-w-0">
                                      <p className="font-semibold text-gray-900 truncate">{p.name}</p>
                                      <p className="text-xs text-gray-500 truncate w-48">{p.description || "No description"}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-600">{p.category?.name || "Uncategorized"}</td>
                                <td className="py-4 px-6 text-sm font-bold text-gray-900">
                                  Rs {Number(p.wholesalerPrice || p.price || 0).toLocaleString()}
                                </td>
                                <td className="py-4 px-6">
                                  {(p.stock || 0) === 0 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Out of stock</span>
                                  ) : (p.stock || 0) < 10 ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">{p.stock} Low stock</span>
                                  ) : (
                                    <span className="text-sm font-medium text-gray-900">{p.stock} units</span>
                                  )}
                                </td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    <button
                                      onClick={() => setModal({ mode: "edit", product: p })}
                                      className="p-2 text-gray-400 hover:text-emerald-600 transition rounded-lg hover:bg-emerald-50"
                                      title="Edit Product"
                                    >
                                      <Edit3 className="w-4 h-4" />
                                    </button>
                                    <button
                                      onClick={() => handleDelete(p._id)}
                                      disabled={deleting === p._id}
                                      className="p-2 text-gray-400 hover:text-red-600 transition rounded-lg hover:bg-red-50"
                                      title="Delete Product"
                                    >
                                      {deleting === p._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* SALES / ORDERS TAB */}
              {tab === "orders" && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">{isWholesaler ? "Sales History" : "My Orders"}</h1>
                  
                  {orders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
                      <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mb-6">
                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">{isWholesaler ? "No sales yet" : "No orders yet"}</h2>
                      <p className="text-gray-500 mt-2">{isWholesaler ? "When retailers purchase your products, they will appear here." : "Start exploring the marketplace to place your first order."}</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100">
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Order ID</th>
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Items</th>
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                              <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {orders.map(o => (
                              <tr key={o._id} className="hover:bg-gray-50 transition">
                                <td 
                                  className="py-4 px-6 font-medium text-gray-900 cursor-pointer" 
                                  onClick={() => setSelectedOrder(o)}
                                >
                                  #{o._id?.slice(-8).toUpperCase()}
                                </td>
                                <td className="py-4 px-6 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                <td className="py-4 px-6 text-sm text-gray-600">{o.items?.length || 0} items</td>
                                <td className="py-4 px-6 font-bold text-gray-900">Rs {Number(o.totalAmount || o.total || 0).toLocaleString()}</td>
                                <td className="py-4 px-6">{getStatusBadge(o.status)}</td>
                                <td className="py-4 px-6 text-right">
                                  <div className="flex items-center justify-end gap-2">
                                    {isWholesaler && (o.status === "pending" || o.status === "processing") && (
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleMarkAsSent(o._id); }}
                                        title="Mark Sent"
                                        className="p-2 text-black hover:bg-gray-100 rounded-lg transition"
                                      >
                                        <Truck className="w-4 h-4" />
                                      </button>
                                    )}

                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        if (isWholesaler && o.user?._id) {
                                          startChat({ orderId: o._id, wholesalerId: o.user._id });
                                        } else if (!isWholesaler) {
                                          const partnerId = o.items[0]?.product?.wholesaler?._id || o.items[0]?.product?.wholesaler;
                                          if (partnerId) startChat({ orderId: o._id, wholesalerId: partnerId });
                                        }
                                      }}
                                      title="Message Partner"
                                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                                    >
                                      <MessageCircle className="w-4 h-4" />
                                    </button>
                                    
                                    {o.status === "delivered" && (
                                      <button 
                                        onClick={() => generateInvoice(o, isWholesaler ? "wholesaler" : "retailer")} 
                                        title="Download Invoice"
                                        className="p-2 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition"
                                      >
                                        <Download className="w-4 h-4" />
                                      </button>
                                    )}

                                    {!isWholesaler && (o.status === "delivered" || o.status === "cancelled") && (
                                      <button 
                                        onClick={() => handleReorder(o)} 
                                        title="Reorder Items"
                                        className="p-2 text-gray-700 hover:text-black hover:bg-gray-100 rounded-lg transition flex items-center gap-1.5 font-semibold text-xs border border-gray-200"
                                      >
                                        <Package className="w-3.5 h-3.5" /> Reorder
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ENTIRE WALLET TAB RENDERING ADDED BELOW ORDERS */}
              {tab === "wallet" && isWholesaler && (
                <div className="space-y-6">
                  <h1 className="text-2xl font-bold text-gray-900">eAson Wallet</h1>
                  <div className="bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden shadow-xl shadow-emerald-900/10">
                    <div className="absolute -top-10 -right-10 p-10 opacity-10">
                      <DollarSign className="w-64 h-64" />
                    </div>
                    <div className="relative z-10">
                      <p className="text-sm font-medium text-emerald-100 uppercase tracking-widest mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4" /> Available Balance</p>
                      <h2 className="text-5xl lg:text-6xl font-bold mb-8">Rs {Number(wallet?.balance || 0).toLocaleString()}</h2>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <button
                          onClick={() => toast.success("Withdrawal request submitted!")}
                          className="px-8 py-3.5 bg-white text-emerald-900 rounded-xl font-bold shadow-sm hover:bg-emerald-50 transition"
                        >
                          Withdraw to Bank
                        </button>
                        <button className="px-8 py-3.5 border border-emerald-400/50 text-white rounded-xl font-bold hover:bg-emerald-800/50 transition">
                          View Escrow Activity
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Transactions</h3>
                    {wallet?.transactions?.length > 0 ? (
                      <div className="space-y-4">
                        {wallet.transactions.slice().reverse().map((t, i) => (
                          <div key={i} className="flex justify-between items-center py-4 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-xl transition">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'credit' ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                                {t.type === 'credit' ? <TrendingUp className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">{t.description}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{new Date(t.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p>
                              </div>
                            </div>
                            <div className={`font-bold text-lg ${t.type === 'credit' ? 'text-emerald-500' : 'text-gray-900'}`}>
                              {t.type === 'credit' ? '+' : '-'} Rs {Math.abs(t.amount).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <DollarSign className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                        <p className="text-gray-400 text-sm">No transactions yet. Complete an order to receive escrow funds.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SETTINGS TAB */}
              {tab === "settings" && (
                <div className="space-y-6 max-w-3xl">
                  <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
                  
                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Account Info</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">Full Name</label>
                        <div className="w-full bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl cursor-not-allowed">
                          {fullName}
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-semibold text-gray-700 block mb-2">Email Address</label>
                        <div className="w-full bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl cursor-not-allowed">
                          {user.email}
                        </div>
                      </div>
                      {isWholesaler && user.shopName && (
                        <div>
                          <label className="text-sm font-semibold text-gray-700 block mb-2">Business Name</label>
                          <div className="w-full bg-gray-50 border border-gray-200 text-gray-600 px-4 py-3 rounded-xl cursor-not-allowed">
                            {user.shopName}
                          </div>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Please contact support to modify protected account information.</p>
                  </div>

                  <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                    <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">Security</h2>
                    <div>
                      <button className="px-6 py-2.5 border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 hover:border-gray-300 transition focus:ring-2 focus:ring-gray-200 outline-none">
                        Change Password
                      </button>
                    </div>
                  </div>

                  <div className="bg-rose-50 p-8 rounded-2xl border border-rose-100 space-y-4">
                    <h2 className="text-lg font-bold text-rose-900">Danger Zone</h2>
                    <p className="text-sm text-rose-700">Ready to wrap up for the day?</p>
                    <button 
                      onClick={() => { logout(); navigate("/"); }}
                      className="px-6 py-2.5 bg-rose-600 text-white font-medium rounded-xl hover:bg-rose-700 transition flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>

                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal.product}
            categories={categories}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); window.location.reload(); }}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {selectedOrder && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 relative"
            >
              <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Details</h2>
              <p className="text-sm text-gray-500 mb-6 font-medium tracking-wide">#{selectedOrder._id?.slice(-8).toUpperCase()}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Order Status</p>
                  <p className="font-bold text-gray-900 capitalize flex items-center gap-2">
                    {getStatusBadge(selectedOrder.status)}
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Info</p>
                  <p className="font-bold text-gray-900 uppercase">
                    {selectedOrder.paymentMethod || "COD"} <span className="text-gray-400 mx-2">•</span> <span className={selectedOrder.paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-600'}>{selectedOrder.paymentStatus}</span>
                  </p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Customer Details</p>
                  <p className="font-bold text-gray-900 text-sm mb-1">{selectedOrder.user?.firstName || "Customer"} {selectedOrder.user?.lastName || ""}</p>
                  <p className="text-sm text-gray-600 truncate">{selectedOrder.shippingAddress}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedOrder.phone}</p>
                </div>
                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 md:col-span-1">
                  <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-2">Order Notes</p>
                  <p className="text-sm text-gray-800 italic">{selectedOrder.notes || "No special instructions provided."}</p>
                </div>
              </div>

              <h3 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3">Products ({selectedOrder.items?.length || 0})</h3>
              <div className="space-y-3 mb-8">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-4 bg-white border border-gray-100 p-4 rounded-2xl shadow-sm hover:border-gray-200 transition">
                    <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100">
                      {item.product?.image ? (
                        <img src={`http://localhost:5000${item.product.image}`} alt={item.product?.name} className="w-full h-full object-contain p-2" />
                      ) : (
                        <Package className="w-6 h-6 text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 truncate">{item.product?.name || "Unknown Product"}</p>
                      <p className="text-sm font-medium text-gray-500 mt-0.5">Quantity: <span className="text-gray-900">{item.quantity}</span></p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-gray-900">Rs {Number(item.pricePerUnit || 0).toLocaleString()}</p>
                      <p className="text-[11px] font-bold text-gray-400 mt-1">TOTAL: Rs {(item.quantity * (item.pricePerUnit || 0)).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-6 border-t-2 border-dashed border-gray-100">
                <p className="text-lg text-gray-500 font-bold uppercase tracking-wider">Grand Total</p>
                <p className="text-3xl font-black text-emerald-600 drop-shadow-sm">Rs {Number(selectedOrder.grandTotal || selectedOrder.totalAmount || 0).toLocaleString()}</p>
              </div>
              
              <div className="mt-8 flex gap-3 justify-end flex-wrap">
                {(selectedOrder.status === "pending" || selectedOrder.status === "processing") && (
                  <button onClick={() => { handleCancelOrder(selectedOrder._id); setSelectedOrder(null); }} className="px-6 py-3 bg-white border-2 border-red-100 text-red-600 font-bold rounded-xl hover:bg-red-50 hover:border-red-200 transition flex items-center gap-2">
                    <XCircle className="w-4 h-4" /> Cancel Order
                  </button>
                )}

                {isWholesaler && (selectedOrder.status === "pending" || selectedOrder.status === "processing") && (
                  <button onClick={() => { handleMarkAsSent(selectedOrder._id); setSelectedOrder(null); }} className="px-6 py-3 bg-black text-white font-bold rounded-xl hover:bg-gray-900 transition flex items-center gap-2">
                    <Truck className="w-4 h-4" /> Mark as Sent
                  </button>
                )}
                
                {!isWholesaler && (selectedOrder.status === "delivered" || selectedOrder.status === "cancelled") && (
                  <button onClick={() => { handleReorder(selectedOrder); setSelectedOrder(null); }} className="px-6 py-3 bg-white border-2 border-gray-200 text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition flex items-center gap-2">
                    <Package className="w-4 h-4" /> Reorder Items
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
