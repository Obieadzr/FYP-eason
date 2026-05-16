import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, TrendingUp, Settings,
  LogOut, CheckCircle2, Boxes, AlertTriangle, ShoppingBag,
  Search, Plus, Edit3, Trash2, Loader2, Download, MessageCircle,
  Image, DollarSign, Clock, Store, Truck, X, XCircle, Users, ArrowUpRight, ArrowDownRight, Calendar, HelpCircle, ChevronDown, ChevronRight, MessageSquare, MapPin, Check, Repeat
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import API from "../../utils/api";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { useChat } from "../../store/useChat";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from "recharts";
import TeamManagement from "../company/TeamManagement.jsx";
import ApprovalQueue from "../company/ApprovalQueue.jsx";
import StandingOrders from "../company/StandingOrders.jsx";

const FONT_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap";
const FONT_STYLE = { fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.02em" };

function KPIBox({ title, value, change, isPositive, hideChange }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col justify-between hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-semibold text-gray-500 tracking-wide">{title}</h3>
        <button className="text-gray-300 hover:text-gray-500"><HelpCircle className="w-4 h-4 stroke-[1.5]" /></button>
      </div>
      <div className="flex items-end justify-between">
        <span className="text-3xl font-bold text-gray-900 leading-none">{value}</span>
        {!hideChange && (
          <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md ${isPositive ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 stroke-[2]" /> : <ArrowDownRight className="w-3 h-3 stroke-[2]" />}
            {Math.abs(change)}%
          </div>
        )}
      </div>
    </div>
  );
}

function ProductModal({ product, categories, onClose, onSave }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: product?.name || "",
    description: product?.description || "",
    price: product?.price || product?.wholesalerPrice || "",
    stock: product?.stock || "",
    category: product?.category?._id || product?.category || "",
    image: null,
    bulkPricing: product?.bulkPricing || [],
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(product?.image ? `http://localhost:5000${product.image}` : null);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (file) { setForm({ ...form, image: file }); setPreview(URL.createObjectURL(file)); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== null && v !== "") {
          if (k === "bulkPricing") fd.append(k, JSON.stringify(v));
          else fd.append(k, v);
        }
      });
      if (isEdit) { await API.put(`/products/${product._id}`, fd); toast.success("Product updated!"); }
      else { await API.post("/products", fd); toast.success("Product added!"); }
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || "Failed."); }
    finally { setLoading(false); }
  };

  const inputCls = "w-full bg-gray-50 border border-gray-200 text-gray-900 placeholder-gray-400 text-sm px-4 py-3 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" style={FONT_STYLE}>
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-3xl z-10">
          <h2 className="text-base font-semibold text-gray-900">{isEdit ? "Edit Product" : "Add New Product"}</h2>
          <button type="button" onClick={onClose} className="p-1.5 text-gray-400 hover:text-black rounded-lg hover:bg-gray-100 transition"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Product Image</label>
            <label className="block cursor-pointer">
              <div className={`h-40 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition ${preview ? "border-transparent" : "border-gray-200 hover:border-emerald-400"}`}>
                {preview ? <img src={preview} alt="preview" className="w-full h-full object-contain p-2" /> : <div className="text-center"><Image className="w-8 h-8 text-gray-300 mx-auto mb-2 stroke-[1.5]" /><p className="text-xs text-gray-400">Click to upload image</p></div>}
              </div>
              <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
            </label>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Product Name *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Premium Grade Flour" className={inputCls} />
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
                <Plus className="w-3 h-3 stroke-[2]" /> Add Tier
              </button>
            </div>
            {form.bulkPricing.map((tier, index) => (
              <div key={index} className="flex gap-3 mb-3 items-center">
                <input
                  type="number"
                  min="2"
                  placeholder="Min Qty"
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
                  placeholder="Price"
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
                  <Trash2 className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            ))}
          </div>
          <motion.button type="submit" disabled={loading} whileTap={{ scale: 0.98 }} className="w-full py-4 bg-emerald-600 text-white text-sm font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-sm">
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
  const [lang, setLang] = useState("EN");
  const [isLangOpen, setIsLangOpen] = useState(false);
  const { addToCart } = useCart();
  
  // Chat
  const { conversations, fetchConversations, setActiveConversation } = useChat();

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
        
        fetchConversations();
      } finally { setLoading(false); }
    };
    if (user.role) load();
  }, [user, isWholesaler, navigate, fetchConversations]);

  const loadProducts = async () => {
    const prodRes = await API.get("/products/my").catch(() => ({ data: [] }));
    setProducts(prodRes.data.products || prodRes.data || []);
  };

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
      toast.success("Order marked as sent via logistics!");
    } catch { toast.error("Failed to update status."); }
  };
  
  const handleClaimItems = async (id) => {
    try {
      await API.put(`/orders/${id}/status`, { status: "delivered" });
      setOrders(prev => prev.map(o => o._id === id ? { ...o, status: "delivered" } : o));
      toast.success("Delivery confirmed!");
    } catch { toast.error("Failed to confirm delivery."); }
  };

  const handleReorder = (order) => {
    let successCount = 0;
    order.items?.forEach(item => {
      if (item.product && typeof item.product === 'object') {
        addToCart(item.product, item.quantity, {});
        successCount++;
      }
    });
    if (successCount > 0) { toast.success(`Items added to cart!`); navigate("/cart"); }
  };

  const wholesalerTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "messages", label: "Inbox", icon: MessageCircle },
    { id: "clients", label: "Clients", icon: Users },
    { id: "products", label: "Products", icon: Package },
    { id: "orders", label: "Sales", icon: TrendingUp },
    { id: "wallet", label: "Payments", icon: DollarSign },
    { id: "team", label: "Team", icon: Users },
    { id: "approvals", label: "Approvals", icon: CheckCircle2 },
    { id: "standing_orders", label: "Standing Orders", icon: Repeat },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const retailerTabs = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "messages", label: "Inbox", icon: MessageCircle },
    { id: "orders", label: "My Orders", icon: ShoppingBag },
    { id: "clients", label: "Vendors", icon: Store },
    { id: "team", label: "Team", icon: Users },
    { id: "approvals", label: "Approvals", icon: CheckCircle2 },
    { id: "standing_orders", label: "Standing Orders", icon: Repeat },
    { id: "settings", label: "Settings", icon: Settings }
  ];

  const tabs = isWholesaler ? wholesalerTabs : retailerTabs;
  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  // Real-Time Analytics
  const validOrders = orders.filter(o => o.status !== "cancelled");
  const totalVolume = validOrders.reduce((s, o) => s + (o.totalAmount || o.total || 0), 0);
  const totalOrdersCount = validOrders.length;
  const aov = totalOrdersCount ? totalVolume / totalOrdersCount : 0;
  const totalItemsProcessed = validOrders.reduce((s, o) => s + (o.items?.reduce((is, i) => is + i.quantity, 0) || 0), 0);
  const upo = totalOrdersCount ? totalItemsProcessed / totalOrdersCount : 0;

  // Wallet logic (Apply 2.5% commission if it's based on totalVolume)
  const actualWalletBalance = wallet?.balance ? wallet.balance : (totalVolume * 0.975); 

  // Real order frequency per day
  const visitorData = useMemo(() => {
    const grouped = {};
    const msInDay = 24 * 60 * 60 * 1000;
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now.getTime() - i * msInDay);
      grouped[d.toLocaleDateString("en-US", { weekday: "short" })] = 0;
    }
    validOrders.forEach(o => {
      const d = new Date(o.createdAt);
      const diffDays = Math.floor((now - d) / msInDay);
      if (diffDays <= 6 && diffDays >= 0) {
        const dateStr = d.toLocaleDateString("en-US", { weekday: "short" });
        if (grouped[dateStr] !== undefined) {
          grouped[dateStr] += 1;
        }
      }
    });
    return Object.keys(grouped).map(date => ({ name: date, Orders: grouped[date] }));
  }, [validOrders]);

  // Clients extraction logic
  const clientsList = useMemo(() => {
    const clientsMap = {};
    validOrders.forEach(o => {
      const client = isWholesaler ? o.retailer : o.wholesaler;
      if (client && client._id) {
        if (!clientsMap[client._id]) {
          clientsMap[client._id] = { ...client, totalOrders: 0, totalSpent: 0 };
        }
        clientsMap[client._id].totalOrders += 1;
        clientsMap[client._id].totalSpent += (o.totalAmount || 0);
      }
    });
    return Object.values(clientsMap);
  }, [validOrders, isWholesaler]);

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-[#f8f9fa] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-600 border-t-transparent flex rounded-full animate-spin" />
      </div>
    );
  }

  const fullName = user.fullName || `${user.firstName} ${user.lastName}`.trim();
  const initial = fullName ? fullName[0].toUpperCase() : "U";

  const getStatusBadge = (status) => {
    const s = {
      pending: "bg-amber-50 text-amber-600 border-amber-200",
      processing: "bg-blue-50 text-blue-600 border-blue-200",
      shipped: "bg-teal-50 text-teal-600 border-teal-200",
      delivered: "bg-emerald-50 text-emerald-600 border-emerald-200",
      cancelled: "bg-rose-50 text-rose-600 border-rose-200"
    }[status] || "bg-gray-50 text-gray-600 border-gray-200";
    return <span className={`px-2.5 py-1 text-[11px] font-bold rounded-md border uppercase tracking-widest ${s}`}>{status}</span>;
  };

  return (
    <>
      <link href={FONT_URL} rel="stylesheet" />
      <div className="min-h-screen bg-[#fafafa] text-gray-900" style={FONT_STYLE}>
        
        {/* TOP NAVBAR */}
        <div className="fixed top-0 left-0 right-0 h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 z-40">
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/")} className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-1">
              eAson.
            </button>
            
            {/* Quick Add Product for Wholesaler */}
            {isWholesaler && (
              <button onClick={() => setModal({})} className="hidden md:flex items-center gap-1.5 bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition px-3 py-1.5 rounded-lg text-sm font-semibold text-gray-700 ml-4">
                <Plus className="w-4 h-4 stroke-[2]" /> Add Product
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-6">
            <button onClick={() => navigate("/marketplace")} className="hidden md:flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-emerald-600 transition">
              Marketplace
            </button>
          
            {/* Working Language Selector */}
            <div className="relative">
              <button onClick={() => setIsLangOpen(!isLangOpen)} className="hidden md:flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100 transition">
                <span className="text-xs font-semibold text-gray-600">{lang === 'EN' ? '🇳🇵 English' : '🇳🇵 Nepali'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-gray-400 stroke-[2]" />
              </button>
              {isLangOpen && (
                <div className="absolute top-full right-0 mt-2 w-32 bg-white border border-gray-100 shadow-lg rounded-xl overflow-hidden py-1 z-50">
                  <button onClick={() => { setLang('EN'); setIsLangOpen(false); }} className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 ${lang === 'EN' ? 'text-emerald-600' : 'text-gray-700'}`}>English</button>
                  <button onClick={() => { setLang('NP'); setIsLangOpen(false); }} className={`w-full text-left px-4 py-2 text-sm font-medium hover:bg-gray-50 ${lang === 'NP' ? 'text-emerald-600' : 'text-gray-700'}`}>Nepali</button>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-5 border-l border-gray-100 pl-6">
              <button className="text-gray-400 hover:text-gray-600 transition" onClick={() => navigate("/marketplace")}><Search className="w-5 h-5 stroke-[1.5]" /></button>
              <button className="text-gray-400 hover:text-emerald-600 transition relative" onClick={() => setTab("messages")}>
                <MessageCircle className="w-5 h-5 stroke-[1.5]" />
                {conversations.some(c => c.unreadCount && c.unreadCount[user._id] > 0) && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
                )}
              </button>
              
              {/* Profile Dropdown Logic (Toggle Settings) */}
              <button onClick={() => setTab("settings")} className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm cursor-pointer border border-emerald-100 hover:bg-emerald-100 transition">
                {initial}
              </button>
            </div>
          </div>
        </div>

        <div className="flex h-[calc(100vh-70px)] pt-[70px]">
          {/* LEFT SIDEBAR */}
          <aside className="w-[260px] shrink-0 bg-white border-r border-gray-100 hidden lg:flex flex-col h-full z-30">
            <div className="p-6 pb-2">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Main Menu</p>
            </div>
            
            <nav className="flex-1 px-4 space-y-1">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[13px] transition-all duration-200 ${
                    tab === t.id
                      ? "bg-emerald-50 text-emerald-600"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <t.icon className={`w-[18px] h-[18px] stroke-[1.5] ${tab === t.id ? 'text-emerald-600' : 'text-gray-400'}`} />
                  {t.label}
                  {t.id === "messages" && conversations.some(c => c.unreadCount && c.unreadCount[user._id] > 0) && (
                    <span className="ml-auto w-2 h-2 bg-emerald-500 rounded-full" />
                  )}
                </button>
              ))}
            </nav>
            
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition cursor-pointer" onClick={() => setTab("settings")}>
                <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-bold text-gray-900 truncate">{fullName}</p>
                  <p className="text-[11px] text-gray-500 truncate capitalize">{user.role}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); logout(); navigate("/"); }} className="p-1.5 text-gray-400 hover:text-red-500 rounded-md transition">
                  <LogOut className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            </div>
          </aside>

          {/* MAIN CONTENT */}
          <main className="flex-1 p-6 lg:p-10 overflow-y-auto bg-[#fafafa]">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="max-w-[1200px] mx-auto pb-24">
                
                {/* OVERVIEW TAB */}
                {tab === "overview" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                      <h1 className="text-[24px] font-bold text-gray-900">Performance Metric</h1>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 bg-white border border-gray-200 px-4 py-2 rounded-xl text-sm font-semibold text-gray-600 shadow-sm cursor-pointer hover:bg-gray-50">
                          <Calendar className="w-4 h-4 text-gray-400 stroke-[1.5]" />
                          Last 7 Days
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                      <KPIBox title="Net Sales" value={`Rs ${Number(totalVolume.toFixed(0)).toLocaleString()}`} change={1.42} isPositive={true} />
                      <KPIBox title="Average Transaction Value" value={`Rs ${Number(aov.toFixed(0)).toLocaleString()}`} change={26.27} isPositive={true} />
                      <KPIBox title="Unit Per Transaction" value={upo.toFixed(2)} change={5.12} isPositive={true} />
                      <KPIBox title="Total Orders" value={totalOrdersCount} change={12.35} isPositive={false} />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                      {/* Order Frequency Bar Chart */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                        <div className="flex items-center justify-between mb-6">
                          <h3 className="text-sm font-bold text-gray-900">Order Frequency</h3>
                          <button className="text-gray-400 hover:text-emerald-600"><Download className="w-4 h-4 stroke-[1.5]" /></button>
                        </div>
                        <div className="h-[280px] w-full">
                          <ResponsiveContainer width="100%" height={280} minWidth={100}>
                            <BarChart data={visitorData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} dy={10} />
                              <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#9ca3af", fontWeight: 600 }} />
                              <Tooltip cursor={{fill: '#f8f9fa'}} contentStyle={{ borderRadius: '8px', border: '1px solid #eee', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', fontWeight: 'bold' }} />
                              <Bar dataKey="Orders" radius={[4, 4, 0, 0]}>
                                {visitorData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.Orders > 0 ? '#10b981' : '#d1fae5'} />
                                ))}
                              </Bar>
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                      {/* Recent Activity List */}
                      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm flex flex-col">
                        <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                          <h3 className="text-sm font-bold text-gray-900">Recent Activity</h3>
                        </div>
                        {validOrders.length === 0 ? (
                           <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
                             <Clock className="w-8 h-8 mb-2 stroke-[1.5]" />
                             <p className="text-sm font-semibold">No recent activity.</p>
                           </div>
                        ) : (
                          <div className="space-y-4 overflow-y-auto max-h-[280px] pr-2">
                            {validOrders.slice(0, 5).map(o => (
                              <div key={o._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition cursor-pointer" onClick={() => setSelectedOrder(o)}>
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                    <ShoppingBag className="w-4 h-4 stroke-[2]" />
                                  </div>
                                  <div>
                                    <p className="text-sm font-bold text-gray-900">Order #{o._id.slice(-6).toUpperCase()}</p>
                                    <p className="text-xs text-gray-500 font-medium">{new Date(o.createdAt).toLocaleDateString()}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-emerald-600">Rs {Number(o.totalAmount || 0).toLocaleString()}</p>
                                  <span className="text-[10px] uppercase font-bold text-gray-400">{o.status}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* MESSAGES TAB (Inline implementation) */}
                {tab === "messages" && (
                  <div className="space-y-6 max-w-4xl">
                    <h1 className="text-[24px] font-bold text-gray-900 mb-6">Inbox</h1>
                    
                    {conversations.length === 0 ? (
                      <div className="bg-white border text-center border-gray-100 rounded-3xl p-16 shadow-sm">
                        <MessageSquare className="w-16 h-16 text-gray-200 mx-auto mb-6 stroke-[1.5]" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No conversations yet</h3>
                        <p className="text-gray-500 mb-8 font-medium">Have a question about a product? Message the supplier directly from the marketplace.</p>
                        <button onClick={() => navigate('/marketplace')} className="px-6 py-3 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition">
                          Explore Marketplace
                        </button>
                      </div>
                    ) : (
                      <div className="bg-white border border-gray-100 shadow-sm rounded-3xl overflow-hidden divide-y divide-gray-100">
                        {conversations.map(conv => {
                          const otherUser = conv.participants.find(p => p.user._id !== user._id)?.user;
                          const unread = conv.unreadCount && conv.unreadCount[user._id] > 0;
                          return (
                            <button 
                              key={conv._id}
                              onClick={() => {
                                // Uses the global chat drawer state instead of redirecting
                                setActiveConversation(conv);
                              }}
                              className={`w-full text-left p-6 flex items-start gap-4 transition-colors hover:bg-gray-50 group relative ${unread ? 'bg-emerald-50/30' : ''}`}
                            >
                              {unread && <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />}
                              <div className="w-12 h-12 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center font-bold text-lg text-gray-600 shrink-0">
                                {otherUser?.firstName?.[0] || 'U'}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-baseline mb-1">
                                  <h4 className={`text-base truncate ${unread ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
                                    {otherUser?.shopName || `${otherUser?.firstName} ${otherUser?.lastName}`}
                                  </h4>
                                  {conv.lastMessage?.sentAt && (
                                    <span className="text-xs font-bold text-gray-400 whitespace-nowrap ml-2">
                                      {new Date(conv.lastMessage.sentAt).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                                <p className={`text-sm truncate pr-4 ${unread ? 'font-bold text-gray-900' : 'text-gray-500 font-medium'}`}>
                                  {conv.lastMessage?.text || 'Sent an attachment'}
                                </p>
                              </div>
                              <div className="shrink-0 flex items-center self-center text-gray-300 group-hover:text-emerald-600 transition-colors pl-2">
                                {unread && <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-4 inline-block"></span>}
                                <ChevronRight className="w-5 h-5 stroke-[2]" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* PRODUCTS TAB */}
                {tab === "products" && isWholesaler && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <h1 className="text-[24px] font-bold text-gray-900">Store Inventory</h1>
                      <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 stroke-[2]" />
                          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search products..." className="w-full bg-white border border-gray-200 text-gray-900 font-medium text-sm rounded-xl pl-9 pr-4 py-2.5 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-sm" />
                        </div>
                        <button onClick={() => setModal({})} className="bg-emerald-600 text-white px-5 py-2.5 text-sm font-bold rounded-xl hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm shrink-0">
                          <Plus className="w-4 h-4 stroke-[2]" /> Add Product
                        </button>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Product</th>
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Category</th>
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Price</th>
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Stock</th>
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredProducts.map(p => (
                            <tr key={p._id} className="hover:bg-gray-50 transition">
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-white border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                                    {p.image ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-cover" /> : <Package className="w-5 h-5 text-gray-300 stroke-[1.5]" />}
                                  </div>
                                  <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">{p.name}</p>
                                    <p className="text-xs text-gray-500 font-medium truncate w-48">{p.description || "No description"}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="py-4 px-6 text-sm font-medium text-gray-600">{p.category?.name || "Uncategorized"}</td>
                              <td className="py-4 px-6 text-sm font-bold text-gray-900">Rs {Number(p.wholesalerPrice || p.price || 0).toLocaleString()}</td>
                              <td className="py-4 px-6">
                                <span className={`text-sm font-bold ${p.stock < 10 ? 'text-rose-600' : 'text-gray-900'}`}>{p.stock} units</span>
                              </td>
                              <td className="py-4 px-6 text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <button onClick={() => setModal(p)} className="p-2 text-gray-400 hover:text-emerald-600 rounded-lg hover:bg-emerald-50 transition"><Edit3 className="w-4 h-4 stroke-[2]" /></button>
                                  <button onClick={() => handleDelete(p._id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition"><Trash2 className="w-4 h-4 stroke-[2]" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                          {filteredProducts.length === 0 && (
                            <tr>
                              <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No products found. Start adding your inventory.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ORDERS TAB */}
                {tab === "orders" && (
                  <div className="space-y-6">
                    <h1 className="text-[24px] font-bold text-gray-900 mb-6">{isWholesaler ? "Sales & Orders" : "My Orders"}</h1>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-100">
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Order ID</th>
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Amount</th>
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest">Status</th>
                            <th className="py-4 px-6 text-[11px] font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {orders.map(o => (
                            <tr key={o._id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => setSelectedOrder(o)}>
                              <td className="py-4 px-6 text-sm font-bold text-emerald-600">#{o._id?.slice(-8).toUpperCase()}</td>
                              <td className="py-4 px-6 text-sm font-medium text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                              <td className="py-4 px-6 text-sm font-bold text-gray-900">Rs {Number(o.totalAmount || 0).toLocaleString()}</td>
                              <td className="py-4 px-6">{getStatusBadge(o.status)}</td>
                              <td className="py-4 px-6 text-right">
                                <button className="text-xs font-bold text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-white hover:text-emerald-600 hover:border-emerald-200 transition">
                                  View
                                </button>
                              </td>
                            </tr>
                          ))}
                          {orders.length === 0 && (
                            <tr>
                              <td colSpan="5" className="py-12 text-center text-gray-400 font-medium">No orders found.</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* WALLET TAB */}
                {tab === "wallet" && isWholesaler && (
                  <div className="space-y-6">
                    <h1 className="text-[24px] font-bold text-gray-900 mb-6">Payments & Wallet</h1>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="bg-emerald-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-lg shadow-emerald-200">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
                        <div className="relative z-10">
                          <div className="flex items-center justify-between mb-2">
                             <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest">Available Balance</p>
                             <span className="bg-emerald-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">Includes 2.5% platform fee deduction</span>
                          </div>
                          <h2 className="text-5xl font-bold leading-none mb-6">Rs {Number(actualWalletBalance.toFixed(0)).toLocaleString()}</h2>
                          <button onClick={() => toast.success("Withdrawal requested successfully!")} className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold text-sm hover:bg-emerald-50 transition shadow-sm">
                            Withdraw Funds
                          </button>
                        </div>
                      </div>
                      <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm flex flex-col justify-center">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Payment Details</h3>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                          Funds are held in escrow until the retailer verifies delivery. Withdrawals to local banks are processed within 24 hours. A 2.5% platform fee is automatically deducted from gross sales.
                        </p>
                        <button className="border-2 border-gray-100 text-gray-700 px-6 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition self-start">
                          Manage Bank Accounts
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CLIENTS TAB */}
                {tab === "clients" && (
                  <div className="space-y-6">
                    <h1 className="text-[24px] font-bold text-gray-900 mb-6">{isWholesaler ? "Customer Directory" : "My Vendors"}</h1>
                    
                    {clientsList.length === 0 ? (
                      <div className="bg-white p-12 rounded-3xl border border-gray-100 shadow-sm flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mb-4">
                          <Users className="w-8 h-8 text-emerald-600 stroke-[1.5]" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Directory Empty</h2>
                        <p className="text-sm text-gray-500 font-medium max-w-md">No connected clients yet. Once an order is placed, they will appear here automatically.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {clientsList.map((client, idx) => (
                          <div key={idx} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition">
                            <div className="flex items-start justify-between mb-4">
                               <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg">
                                 {client.shopName ? client.shopName[0] : (client.firstName ? client.firstName[0] : 'U')}
                               </div>
                               <span className="bg-gray-50 text-gray-600 border border-gray-200 px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider">
                                 {client.totalOrders} Orders
                               </span>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{client.shopName || `${client.firstName} ${client.lastName}`}</h3>
                            <p className="text-sm font-medium text-gray-500 mb-4">{client.email}</p>
                            
                            <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                               <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total Value</p>
                               <p className="text-sm font-bold text-gray-900">Rs {client.totalSpent.toLocaleString()}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* SETTINGS TAB */}
                {tab === "settings" && (
                  <div className="space-y-6 max-w-2xl">
                    <h1 className="text-[24px] font-bold text-gray-900 mb-6">Account Settings</h1>
                    <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
                      <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Details</h2>
                      <div className="space-y-5">
                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Full Name</label>
                          <input disabled value={fullName} className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium" />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Email Address</label>
                          <input disabled value={user.email} className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium" />
                        </div>
                        {user.shopName && (
                          <div>
                            <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase">Shop Name</label>
                            <input disabled value={user.shopName} className="w-full bg-gray-50 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl text-sm font-medium" />
                          </div>
                        )}
                      </div>
                      <div className="mt-8 pt-6 border-t border-gray-100">
                        <button className="px-6 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
                          Change Password
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* B2B COMPANY TABS */}
                {tab === "team" && <TeamManagement />}
                {tab === "approvals" && <ApprovalQueue />}
                {tab === "standing_orders" && <StandingOrders />}

              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {modal && <ProductModal product={modal} categories={categories} onClose={() => setModal(null)} onSave={() => { setModal(null); loadProducts(); }} />}

        {/* ORDER DETAILS MODAL */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setSelectedOrder(null)}>
              <motion.div initial={{ scale: 0.95, opacity: 0, y: 10 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 10 }} className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-8 relative">
                <button onClick={() => setSelectedOrder(null)} className="absolute top-6 right-6 p-2 text-gray-400 hover:text-black rounded-xl hover:bg-gray-100 transition"><X className="w-5 h-5 stroke-[2]" /></button>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Order Details</h2>
                <p className="text-sm text-gray-500 font-semibold mb-6">#{selectedOrder._id?.slice(-8).toUpperCase()}</p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Status</p>
                    {getStatusBadge(selectedOrder.status)}
                  </div>
                  <div className="bg-gray-50 border border-gray-100 p-4 rounded-2xl">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Total Amount</p>
                    <p className="text-xl font-bold text-gray-900">Rs {Number(selectedOrder.totalAmount || 0).toLocaleString()}</p>
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-2">Order Items</h3>
                <div className="space-y-3 mb-8">
                  {selectedOrder.items?.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-4 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:border-gray-300 transition">
                      <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center shrink-0 border border-gray-100"><Package className="w-5 h-5 text-gray-400 stroke-[1.5]" /></div>
                      <div className="flex-1"><p className="text-sm font-bold text-gray-900">{item.product?.name || "Product"}</p><p className="text-xs font-semibold text-gray-500">Qty: {item.quantity}</p></div>
                      <div className="text-right"><p className="text-sm font-bold text-emerald-600">Rs {(item.quantity * (item.pricePerUnit || 0)).toLocaleString()}</p></div>
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-wrap justify-end gap-3 pt-4 border-t border-gray-100">
                  {/* Wholesaler Logic */}
                  {isWholesaler && (selectedOrder.status === "pending" || selectedOrder.status === "processing") && (
                    <button onClick={() => { handleMarkAsSent(selectedOrder._id); setSelectedOrder(null); }} className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition flex items-center gap-2">
                      <Truck className="w-4 h-4 stroke-[2]" /> Assign Logistics & Ship
                    </button>
                  )}
                  
                  {/* Retailer Logic */}
                  {!isWholesaler && selectedOrder.status === "shipped" && (
                    <button onClick={() => { handleClaimItems(selectedOrder._id); setSelectedOrder(null); }} className="px-5 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 transition flex items-center gap-2">
                      <Check className="w-4 h-4 stroke-[2]" /> Claim Delivery
                    </button>
                  )}
                  {!isWholesaler && (selectedOrder.status === "delivered" || selectedOrder.status === "completed") && (
                    <button onClick={() => { handleReorder(selectedOrder); setSelectedOrder(null); }} className="px-5 py-2.5 bg-black text-white font-bold text-sm rounded-xl hover:bg-gray-900 transition flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 stroke-[2]" /> Smart Re-order
                    </button>
                  )}

                  <button onClick={() => setSelectedOrder(null)} className="px-5 py-2.5 bg-white border border-gray-200 text-gray-700 font-bold text-sm rounded-xl hover:bg-gray-50 transition">Close</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
