// src/pages/wholesaler/WholesalerDashboard.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Package, TrendingUp, ShoppingBag, Plus, Eye, MessageCircle,
  BarChart3, ArrowRight, Store, CheckCircle, Clock, AlertCircle,
  LogOut, Settings, Search, ShoppingCart, Trash2, Edit3, X,
  Loader2, Image, DollarSign, Layers, Tag, Truck, Download
} from "lucide-react";
import API from "../../utils/api";
import { useAuthStore } from "../../store/authStore";
import { useCart } from "../../context/CartContext";
import { useChat } from "../../store/useChat";
import { generateInvoice } from "../../utils/generateInvoice";
import toast from "react-hot-toast";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

/* ─── helpers ─────────────────────────────────────────────────────────── */
const FONT = { fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" };

function StatCard({ icon: Icon, label, value, color = "gray" }) {
  const bg = { emerald: "bg-emerald-50 text-emerald-600", indigo: "bg-indigo-50 text-indigo-600", amber: "bg-amber-50 text-amber-600", rose: "bg-rose-50 text-rose-500" };
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-6 hover:shadow-sm transition">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${bg[color]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">{label}</p>
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

/* ─── Main Dashboard ──────────────────────────────────────────────────── */
export default function WholesalerDashboard() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { cartCount } = useCart();
  const { startChat } = useChat();

  const [myProducts, setMyProducts] = useState([]);
  const [orders, setOrders]         = useState([]);
  const [categories, setCategories] = useState([]);
  const [wallet, setWallet]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState("overview");
  const [search, setSearch]         = useState("");
  const [modal, setModal]           = useState(null); // null | { mode: 'add' | 'edit', product? }
  const [deleting, setDeleting]     = useState(null);

  const load = async () => {
    try {
      const [prodRes, orderRes, catRes, walletRes] = await Promise.all([
        API.get("/products/my"),
        API.get("/orders/wholesaler").catch(() => ({ data: [] })),
        API.get("/categories").catch(() => ({ data: [] })),
        API.get("/payment/wallet").catch(() => ({ data: { wallet: null } })),
      ]);
      setMyProducts(prodRes.data || []);
      setOrders(orderRes.data || []);
      setCategories(catRes.data || []);
      setWallet(walletRes.data?.wallet || null);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await API.delete(`/products/${id}`);
      setMyProducts(prev => prev.filter(p => p._id !== id));
      toast.success("Product deleted.");
    } catch {
      toast.error("Could not delete product.");
    } finally { setDeleting(null); }
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

  const filtered = myProducts.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  const totalStock  = myProducts.reduce((s, p) => s + (p.stock || 0), 0);
  const pending     = orders.filter(o => o.status === "pending").length;

  const revenueData = useMemo(() => {
    // Group orders by date
    const grouped = {};
    const msInDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    
    // Initialize last 7 days to 0
    for(let i=6; i>=0; i--) {
      const d = new Date(now.getTime() - i * msInDay);
      const dateStr = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      grouped[dateStr] = 0;
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

    return Object.keys(grouped).map(date => ({
      name: date,
      Revenue: grouped[date]
    }));
  }, [orders]);

  const tabs = [
    { id: "overview",  icon: BarChart3,   label: "Overview"  },
    { id: "products",  icon: Package,     label: "Products"  },
    { id: "orders",    icon: ShoppingBag, label: "Orders"    },
    { id: "wallet",    icon: DollarSign,  label: "eAson Wallet"}
  ];

  if (!user?.verified) {
    return (
      <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center" style={FONT}>
        <div className="max-w-sm text-center p-8">
          <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <Clock className="w-6 h-6 text-amber-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Awaiting verification</h2>
          <p className="text-sm text-gray-500 leading-relaxed">Your wholesaler account is being reviewed. Usually takes 24–48 hours.</p>
          <button onClick={() => navigate("/marketplace")} className="mt-7 px-7 py-3.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition">
            Browse Marketplace
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f5f5f5]" style={FONT}>
      <div className="flex min-h-screen">

        {/* Sidebar */}
        <aside className="w-60 bg-white border-r border-gray-100 flex flex-col p-5 fixed top-0 left-0 h-full z-40 hidden lg:flex">
          <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight mb-10 mt-2">
            eAson<span className="text-emerald-400">.</span>
          </Link>
          <nav className="flex-1 space-y-1">
            {tabs.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition ${
                  activeTab === id ? "bg-black text-white" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon className="w-4 h-4" /> {label}
              </button>
            ))}
            <button
              onClick={() => navigate("/marketplace")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition text-gray-500 hover:bg-gray-50 hover:text-gray-900"
            >
              <Store className="w-4 h-4" /> Marketplace
            </button>
          </nav>
          <div className="space-y-1 pt-5 border-t border-gray-100">
            <button onClick={() => navigate("/settings")} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-500 hover:bg-gray-50 rounded-xl transition">
              <Settings className="w-4 h-4" /> Settings
            </button>
            <button onClick={() => { logout(); navigate("/"); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition">
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
                {tabs.find(t => t.id === activeTab)?.label}
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">Welcome, {user?.firstName}</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate("/cart")} className="relative p-2 text-gray-500 hover:text-black">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button
                onClick={() => navigate("/marketplace")}
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-black rounded-full text-sm font-semibold hover:bg-gray-50 transition"
              >
                <Store className="w-4 h-4" /> Browse Marketplace
              </button>
              <button
                onClick={() => setModal({ mode: "add" })}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 transition"
              >
                <Plus className="w-4 h-4" /> Add Product
              </button>
            </div>
          </div>

          {/* ── OVERVIEW ── */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Package}    label="Listed"        value={myProducts.length} color="emerald" />
                <StatCard icon={ShoppingBag} label="Orders"       value={orders.length}    color="indigo"  />
                <StatCard icon={TrendingUp}  label="Total Stock"  value={totalStock}        color="amber"   />
                <StatCard icon={AlertCircle} label="Pending"      value={pending}           color="rose"    />
              </div>

              {/* Revenue Chart */}
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                <h2 className="text-sm font-semibold text-gray-900 mb-6">Revenue Over Time (Last 7 Days)</h2>
                <div className="w-full h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#9ca3af" }} tickFormatter={(val) => `Rs${val}`} dx={-10} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                        formatter={(value) => [`Rs ${value.toLocaleString()}`, "Revenue"]}
                      />
                      <Area type="monotone" dataKey="Revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent products */}
              {myProducts.length > 0 && (
                <div className="bg-white border border-gray-100 rounded-2xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-sm font-semibold text-gray-900">Your Products</h2>
                    <button onClick={() => setActiveTab("products")} className="text-xs text-emerald-600 font-medium flex items-center gap-1">
                      View all <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="space-y-3">
                    {myProducts.slice(0, 5).map(p => (
                      <div key={p._id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                          {p.image
                            ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-contain p-1" />
                            : <Package className="w-5 h-5 text-gray-300 m-auto" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.stock ?? "—"} in stock</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-gray-900">
                            Rs {Number(p.price || p.wholesalerPrice || 0).toLocaleString()}
                          </span>
                          <button onClick={() => setModal({ mode: "edit", product: p })}
                            className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition">
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── PRODUCTS ── */}
          {activeTab === "products" && (
            <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
              {/* Table toolbar */}
              <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100">
                <div className="relative flex-1 max-w-xs">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                  <input
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search products..."
                    className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 text-sm rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <button
                  onClick={() => setModal({ mode: "add" })}
                  className="flex items-center gap-2 px-4 py-2.5 bg-black text-white text-xs font-semibold rounded-xl hover:bg-gray-900 transition"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </div>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="w-7 h-7 text-gray-300 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                  <Package className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400 mb-5">
                    {search ? "No products match your search." : "No products listed yet."}
                  </p>
                  {!search && (
                    <button onClick={() => setModal({ mode: "add" })}
                      className="px-6 py-3 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition">
                      Add First Product
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        {["Product", "Category", "Stock", "Price", "Status", ""].map(h => (
                          <th key={h} className={`py-3 px-4 text-[11px] font-semibold text-gray-400 uppercase tracking-wider ${h === "" ? "text-right" : "text-left"}`}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filtered.map(p => (
                        <tr key={p._id} className="hover:bg-gray-50/70 transition">
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-xl overflow-hidden shrink-0">
                                {p.image
                                  ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-contain p-1" />
                                  : <Package className="w-4 h-4 text-gray-300 m-auto" />}
                              </div>
                              <span className="font-medium text-gray-900 line-clamp-1">{p.name}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-500">{p.category?.name || "—"}</td>
                          <td className="py-4 px-4">
                            <span className={`font-semibold ${(p.stock || 0) <= 5 ? "text-red-500" : "text-gray-900"}`}>
                              {p.stock ?? "—"}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-semibold text-gray-900">
                            Rs {Number(p.price || p.wholesalerPrice || 0).toLocaleString()}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${(p.stock || 0) > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"}`}>
                              {(p.stock || 0) > 0 ? "In Stock" : "Out of Stock"}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => setModal({ mode: "edit", product: p })}
                                className="p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition">
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id}
                                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition">
                                {deleting === p._id
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Trash2 className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── ORDERS ── */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              {orders.length === 0 ? (
                <div className="bg-white border border-gray-100 rounded-2xl py-20 text-center">
                  <ShoppingBag className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-sm text-gray-400">No orders received yet.</p>
                </div>
              ) : orders.map(order => (
                <div key={order._id} className="bg-white border border-gray-100 rounded-2xl p-5 flex items-start justify-between gap-4 hover:border-gray-200 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-gray-900">#{order._id?.slice(-6).toUpperCase()}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        order.status === "pending"   ? "bg-amber-50 text-amber-600"   :
                        order.status === "delivered" ? "bg-emerald-50 text-emerald-600" :
                                                       "bg-gray-100 text-gray-600"
                      }`}>{order.status}</span>
                    </div>
                    <p className="text-xs text-gray-400">
                      {order.user?.firstName} {order.user?.lastName} · {order.items?.length} item(s)
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(order.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">Rs {Number(order.total || order.totalAmount || 0).toLocaleString()}</p>
                    <div className="mt-3 flex items-center justify-end gap-2">
                       { (order.status === "pending" || order.status === "processing") && (
                         <button
                           onClick={() => handleMarkAsSent(order._id)}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-black text-white rounded-lg text-xs font-semibold hover:bg-gray-900 transition"
                         >
                           <Truck className="w-3.5 h-3.5" /> Mark Sent
                         </button>
                       )}
                       { order.status === "delivered" && (
                         <button
                           onClick={() => generateInvoice(order, "wholesaler")}
                           className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold hover:bg-blue-100 border border-blue-100 transition"
                         >
                           <Download className="w-3.5 h-3.5" /> Invoice
                         </button>
                       )}
                       <button
                         onClick={() => {
                           if (order.user?._id) {
                             startChat({ wholesalerId: order.user._id, orderId: order._id });
                           } else {
                             toast.error("Buyer details missing");
                           }
                         }}
                         className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-semibold hover:bg-emerald-100 border border-emerald-100 transition"
                       >
                         <MessageCircle className="w-3.5 h-3.5" /> Message buyer
                       </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}


          {/* ── WALLET ── */}
          {activeTab === "wallet" && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                 <div className="absolute top-0 right-0 p-10 opacity-10">
                   <DollarSign className="w-40 h-40" />
                 </div>
                 <div className="relative z-10">
                   <p className="text-sm font-medium text-emerald-100 uppercase tracking-widest mb-1">Available Escrow Balance</p>
                   <h2 className="text-5xl font-bold mb-6">Rs {Number(wallet?.balance || 0).toLocaleString()}</h2>
                   <div className="flex gap-4">
                     <button
                       onClick={() => toast("Withdrawal initiated!")}
                       className="px-6 py-3 bg-white text-emerald-900 rounded-xl font-bold shadow-sm hover:bg-gray-50 transition"
                     >
                       Withdraw to Bank
                     </button>
                     <button className="px-6 py-3 border border-emerald-400 text-white rounded-xl font-bold hover:bg-emerald-800 transition">
                       View Escrow Activity
                     </button>
                   </div>
                 </div>
              </div>
              
              <div className="bg-white border border-gray-100 rounded-2xl p-6">
                 <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Transactions</h3>
                 {wallet?.transactions?.length > 0 ? (
                   <div className="space-y-4">
                     {wallet.transactions.reverse().map((t, i) => (
                       <div key={i} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0">
                         <div>
                           <p className="font-semibold text-gray-900">{t.description}</p>
                           <p className="text-xs text-gray-400">{new Date(t.date).toLocaleString()}</p>
                         </div>
                         <div className={`font-bold ${t.type === 'credit' ? 'text-emerald-500' : 'text-gray-900'}`}>
                           {t.type === 'credit' ? '+' : '-'} Rs {Math.abs(t.amount).toLocaleString()}
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : (
                   <p className="text-gray-400 text-sm">No transactions yet. Complete an order to receive escrow funds.</p>
                 )}
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Product Modal */}
      <AnimatePresence>
        {modal && (
          <ProductModal
            product={modal.product}
            categories={categories}
            onClose={() => setModal(null)}
            onSave={() => { setModal(null); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
