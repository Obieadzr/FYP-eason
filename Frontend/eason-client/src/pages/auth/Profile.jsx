// src/pages/auth/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Edit3, Package, ShoppingBag, Settings,
  LogOut, Check, Camera, Plus, Trash2, Loader2,
  TrendingUp, BarChart3, Store, Search, X
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import API from "../../utils/api";
import toast from "react-hot-toast";

const inputCls = "w-full bg-white border border-gray-300 text-black placeholder-gray-400 text-sm px-4 py-4 focus:outline-none focus:border-black focus:ring-1 focus:ring-black transition-colors rounded-none font-bold tracking-widest uppercase";

/* ─── Stat badge ─────────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value }) {
  return (
    <div className="bg-white border border-gray-200 p-6 hover:border-black transition-colors duration-300">
      <div className="w-10 h-10 bg-[#f9f9f9] border border-gray-200 flex items-center justify-center mb-6">
        <Icon className="w-5 h-5 text-black" />
      </div>
      <p className="text-4xl font-bold tracking-tighter text-black mb-1">{value}</p>
      <p className="text-xs text-gray-500 tracking-widest uppercase font-bold">{label}</p>
    </div>
  );
}

/* ─── Edit/Add Product Modal ──────────────────────────────────────────────── */
function ProductModal({ product, categories, onClose, onSave }) {
  const isEdit = !!product?._id;
  const [form, setForm] = useState({
    name: product?.name || "", description: product?.description || "",
    price: product?.price || product?.wholesalerPrice || "",
    stock: product?.stock ?? "", category: product?.category?._id || product?.category || "",
    image: null,
  });
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(product?.image ? `http://localhost:5000${product.image}` : null);

  const handleFile = e => {
    const f = e.target.files[0];
    if (f) { setForm({ ...form, image: f }); setPreview(URL.createObjectURL(f)); }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v !== null && v !== "") fd.append(k, v); });
      if (isEdit) await API.put(`/products/${product._id}`, fd, { headers: { "Content-Type": "multipart/form-data" } });
      else await API.post("/products", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success(isEdit ? "Product updated!" : "Product added!");
      onSave();
    } catch (err) { toast.error(err.response?.data?.message || "Failed."); }
    finally { setLoading(false); }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div
        initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        exit={{ y: 60, opacity: 0 }} transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="bg-white w-full sm:max-w-md max-h-[90vh] overflow-y-auto rounded-none border-t-4 border-black"
      >
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold tracking-tighter uppercase">{isEdit ? "Edit Product" : "New Product"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-black" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Image */}
          <label className="block cursor-pointer">
            <div className={`h-48 border border-gray-300 border-dashed hover:border-black transition-colors flex items-center justify-center bg-[#f9f9f9]`}>
              {preview
                ? <img src={preview} alt="preview" className="w-full h-full object-contain p-2" />
                : <div className="text-center"><Camera className="w-8 h-8 text-black mx-auto mb-2" /><p className="text-xs font-bold uppercase tracking-widest text-gray-400">Upload photo</p></div>}
            </div>
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
          </label>
          <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="PRODUCT NAME" className={inputCls} />
          <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} placeholder="DESCRIPTION (OPTIONAL)" className={`${inputCls} resize-none`} />
          <div className="grid grid-cols-2 gap-4">
            <input required type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} placeholder="PRICE (RS)" className={inputCls} />
            <input required type="number" min="0" value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="STOCK QTY" className={inputCls} />
          </div>
          {categories.length > 0 && (
            <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })} className={inputCls}>
              <option value="">SELECT CATEGORY</option>
              {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
          )}
          <button type="submit" disabled={loading}
            className="w-full py-5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-3 mt-4">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {loading ? "SAVING..." : isEdit ? "SAVE CHANGES" : "ADD PRODUCT"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────── */
export default function Profile() {
  const navigate  = useNavigate();
  const { user, logout, setUser } = useAuthStore();
  const [tab, setTab] = useState("overview"); 
  const isWholesaler = user?.role === "wholesaler";

  // Data
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal] = useState(null);
  const [dataLoad, setDataLoad] = useState(true);
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState(null);

  // Profile form
  const [profile, setProfile] = useState({
    firstName: user?.firstName || "", lastName: user?.lastName || "",
    email: user?.email || "", phone: user?.phone || "",
    shopName: user?.shopName || "", address: user?.address || "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user) return navigate("/login");
    const load = async () => {
      try {
        const [orderRes, catRes] = await Promise.all([
          API.get(isWholesaler ? "/orders/wholesaler" : "/orders/my-orders").catch(() => ({ data: [] })),
          API.get("/categories").catch(() => ({ data: [] })),
        ]);
        setOrders(orderRes.data?.orders || orderRes.data || []);
        setCategories(catRes.data || []);
        if (isWholesaler) {
          const prodRes = await API.get("/products/my").catch(() => ({ data: [] }));
          setProducts(prodRes.data.products || prodRes.data || []);
        }
      } finally { setDataLoad(false); }
    };
    if (user.role) load(); // ensure role is loaded
  }, [user, isWholesaler, navigate]);

  // Set default tab if not wholesaler
  useEffect(() => {
    if (user && !isWholesaler && tab === "overview") setTab("orders");
  }, [user, isWholesaler, tab]);

  const handleSave = async e => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await API.put("/auth/profile", profile);
      setUser?.({ ...user, ...res.data.user });
      toast.success("Profile updated!");
    } catch (err) { toast.error(err.response?.data?.message || "Failed."); }
    finally { setSaving(false); }
  };

  const handleDelete = async id => {
    if (!window.confirm("Delete this product?")) return;
    setDeleting(id);
    try {
      await API.delete(`/products/${id}`);
      setProducts(p => p.filter(x => x._id !== id));
      toast.success("Deleted.");
    } catch { toast.error("Could not delete."); }
    finally { setDeleting(null); }
  };

  const reloadProducts = async () => {
    const res = await API.get("/products/my").catch(() => ({ data: [] }));
    setProducts(res.data.products || res.data || []);
    setModal(null);
  };

  const tabs = isWholesaler
    ? [
        { id: "overview", label: "Overview", icon: BarChart3 },
        { id: "products", label: "Products", icon: Package },
        { id: "orders", label: "Sales", icon: ShoppingBag },
        { id: "settings", label: "Settings", icon: Settings }
      ]
    : [
        { id: "orders", label: "My Orders", icon: ShoppingBag },
        { id: "settings", label: "Settings", icon: Settings }
      ];

  const filteredProducts = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  const totalStock = products.reduce((s, p) => s + (p.stock || 0), 0);
  const pendingOrders = orders.filter(o => o.status === "pending").length;

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#f9f9f9]" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* ── Navbar ── */}
      <header className="bg-[#111111] sticky top-0 z-40 border-b border-black">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/marketplace" className="text-white text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
            eAson<span className="text-emerald-400">.</span>
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-xs text-gray-500 font-bold uppercase tracking-widest hidden sm:inline">
              Welcome, {user.firstName}
            </span>
            <button onClick={() => navigate("/marketplace")} className="text-xs font-bold text-white hover:text-gray-300 uppercase tracking-widest transition-colors">
              Market
            </button>
            <button onClick={() => { logout(); navigate("/"); }} className="text-xs font-bold text-red-500 hover:text-red-400 uppercase tracking-widest transition-colors flex items-center gap-2">
              <LogOut className="w-3.5 h-3.5" /> Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col lg:flex-row gap-12">
          
          {/* ── Left Sidebar ── */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="bg-white border border-gray-200 p-8 mb-8 text-center sticky top-32">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center text-white text-4xl font-bold tracking-tighter mx-auto mb-6">
                {(user.firstName?.[0] || "U").toUpperCase()}
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-black mb-1">{user.firstName} {user.lastName}</h1>
              {user.shopName && <p className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-3">{user.shopName}</p>}
              <span className={`inline-block text-[10px] uppercase tracking-widest border font-bold px-3 py-1 ${isWholesaler ? "border-black text-black bg-gray-50" : "border-gray-200 text-gray-500"}`}>
                {isWholesaler ? "Verified Supplier" : "Retailer"}
              </span>

              <nav className="mt-10 space-y-2 text-left">
                {tabs.map(t => (
                  <button
                    key={t.id}
                    onClick={() => setTab(t.id)}
                    className={`w-full flex items-center gap-4 px-5 py-4 text-xs font-bold uppercase tracking-widest transition-colors ${
                      tab === t.id
                        ? "bg-black text-white"
                        : "text-gray-500 hover:bg-gray-100 hover:text-black"
                    }`}
                  >
                    <t.icon className="w-4 h-4" />
                    {t.label}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {/* ── Right Content Area ── */}
          <main className="flex-1 min-w-0">
            {dataLoad ? (
              <div className="flex justify-center py-32"><Loader2 className="w-8 h-8 text-gray-300 animate-spin" /></div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={tab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  
                  {/* OVERVIEW TAB */}
                  {tab === "overview" && isWholesaler && (
                    <div className="space-y-8">
                      <div>
                        <h2 className="text-3xl font-bold tracking-tighter uppercase mb-6">Overview</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                          <StatCard icon={Package} label="Total Products" value={products.length} />
                          <StatCard icon={ShoppingBag} label="Total Orders" value={orders.length} />
                          <StatCard icon={TrendingUp} label="Total Stock" value={totalStock} />
                          <StatCard icon={BarChart3} label="Pending Orders" value={pendingOrders} />
                        </div>
                      </div>

                      {products.length > 0 && (
                        <div className="bg-white border border-gray-200 p-8 mt-8">
                          <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold tracking-tighter uppercase">Recent Inventory</h3>
                            <button onClick={() => setTab("products")} className="text-xs font-bold uppercase tracking-widest border-b border-black pb-1 hover:text-gray-600 transition-colors">
                              View All
                            </button>
                          </div>
                          <div className="space-y-4">
                            {products.slice(0, 4).map(p => (
                              <div key={p._id} className="flex items-center gap-4 p-4 border border-gray-100 bg-[#f9f9f9]">
                                <div className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                  {p.image ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-8 h-8 object-contain" /> : <Package className="w-5 h-5 text-gray-300" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-bold text-black truncate uppercase tracking-widest">{p.name}</p>
                                  <p className="text-xs font-bold text-gray-400 tracking-widest mt-1">{p.stock ?? 0} IN STOCK</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold tracking-tight text-black">Rs {Number(p.price || p.wholesalerPrice || 0).toLocaleString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* PRODUCTS TAB */}
                  {tab === "products" && isWholesaler && (
                    <div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
                        <h2 className="text-3xl font-bold tracking-tighter uppercase">Inventory</h2>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                          <div className="relative flex-1 sm:w-64">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                              value={search}
                              onChange={e => setSearch(e.target.value)}
                              placeholder="SEARCH PRODUCTS..."
                              className="w-full bg-white border border-gray-200 text-black placeholder-gray-400 text-xs font-bold tracking-widest uppercase px-12 py-4 focus:outline-none focus:border-black transition-colors"
                            />
                          </div>
                          <button
                            onClick={() => setModal({ mode: "add" })}
                            className="bg-black text-white px-6 py-4 text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition-colors shrink-0 flex items-center gap-2"
                          >
                            <Plus className="w-4 h-4" /> ADD
                          </button>
                        </div>
                      </div>

                      {filteredProducts.length === 0 ? (
                        <div className="bg-white border border-gray-200 py-32 text-center">
                          <Package className="w-12 h-12 text-gray-300 mx-auto mb-6" />
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">No products found.</p>
                          <button onClick={() => setModal({ mode: "add" })} className="border-b-2 border-black pb-1 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
                            List a product
                          </button>
                        </div>
                      ) : (
                        <div className="bg-white border border-gray-200 overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-[#f9f9f9] border-b border-gray-200">
                                <th className="py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Product</th>
                                <th className="py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                                <th className="py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Stock</th>
                                <th className="py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">Price</th>
                                <th className="py-5 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {filteredProducts.map(p => (
                                <tr key={p._id} className="hover:bg-[#f9f9f9] transition-colors">
                                  <td className="py-4 px-6">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 bg-white border border-gray-200 flex items-center justify-center shrink-0">
                                        {p.image ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-8 h-8 object-contain" /> : <Package className="w-4 h-4 text-gray-300" />}
                                      </div>
                                      <span className="font-bold text-black uppercase tracking-widest text-xs line-clamp-1">{p.name}</span>
                                    </div>
                                  </td>
                                  <td className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-widest">{p.category?.name || "—"}</td>
                                  <td className="py-4 px-6">
                                    <span className={`text-xs font-bold uppercase tracking-widest ${(p.stock || 0) <= 5 ? "text-red-600" : "text-black"}`}>
                                      {p.stock ?? "—"}
                                    </span>
                                  </td>
                                  <td className="py-4 px-6 text-sm font-bold text-black tracking-tight">
                                    Rs {Number(p.price || p.wholesalerPrice || 0).toLocaleString()}
                                  </td>
                                  <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-3">
                                      <button onClick={() => setModal({ mode: "edit", product: p })} className="text-xs font-bold text-gray-400 hover:text-black uppercase tracking-widest transition-colors border-b border-transparent hover:border-black">Edit</button>
                                      <span className="text-gray-300">|</span>
                                      <button onClick={() => handleDelete(p._id)} disabled={deleting === p._id} className="text-xs font-bold text-gray-400 hover:text-red-600 uppercase tracking-widest transition-colors border-b border-transparent hover:border-red-600">
                                        {deleting === p._id ? "..." : "Delete"}
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

                  {/* ORDERS TAB */}
                  {tab === "orders" && (
                    <div>
                      <h2 className="text-3xl font-bold tracking-tighter uppercase mb-8">{isWholesaler ? "Sales History" : "Order History"}</h2>
                      
                      {orders.length === 0 ? (
                        <div className="bg-white border border-gray-200 py-32 text-center">
                          <ShoppingBag className="w-12 h-12 text-gray-300 mx-auto mb-6" />
                          <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-8">{isWholesaler ? "No sales yet." : "No orders yet."}</p>
                          <button onClick={() => navigate("/marketplace")} className="border-b-2 border-black pb-1 text-xs font-bold uppercase tracking-widest hover:text-gray-600 transition-colors">
                            Explore Market
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {orders.map(order => (
                            <div key={order._id} className="bg-white border border-gray-200 p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-black transition-colors">
                              <div className="flex items-center gap-6">
                                <div className="w-16 h-16 bg-[#f9f9f9] border border-gray-100 flex items-center justify-center shrink-0">
                                  <ShoppingBag className="w-6 h-6 text-black" />
                                </div>
                                <div>
                                  <p className="text-xl font-bold tracking-tighter text-black uppercase mb-1">#{order._id?.slice(-8)}</p>
                                  <p className="text-xs text-gray-500 uppercase font-bold tracking-widest">
                                    {order.items?.length} ITEM(S) · {new Date(order.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                                  </p>
                                </div>
                              </div>
                              <div className="flex flex-col md:items-end gap-2 text-left md:text-right border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                                <p className="text-xl font-bold tracking-tighter text-black">Rs {Number(order.totalAmount || order.total || 0).toLocaleString()}</p>
                                <span className={`inline-block text-[10px] uppercase font-bold tracking-widest px-3 py-1 border ${
                                  order.status === "delivered" ? "border-black text-black bg-gray-50" :
                                  order.status === "pending" ? "border-amber-200 text-amber-700 bg-amber-50" : "border-gray-200 text-gray-500"
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* SETTINGS TAB */}
                  {tab === "settings" && (
                    <div>
                      <h2 className="text-3xl font-bold tracking-tighter uppercase mb-8">Settings</h2>
                      <form onSubmit={handleSave} className="bg-white border border-gray-200 p-8 sm:p-12 space-y-8">
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-3">First Name</label>
                            <input value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })} className={inputCls} />
                          </div>
                          <div>
                            <label className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-3">Last Name</label>
                            <input value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })} className={inputCls} />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-3">Email Address</label>
                          <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className={inputCls} />
                        </div>

                        <div>
                          <label className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-3">Phone Number</label>
                          <input value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} placeholder="98XXXXXXXX" className={inputCls} />
                        </div>

                        {isWholesaler && (
                          <div className="pt-4 border-t border-gray-100 space-y-8">
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-3">Business Name</label>
                              <input value={profile.shopName} onChange={e => setProfile({ ...profile, shopName: e.target.value })} placeholder="Business Name" className={inputCls} />
                            </div>
                            <div>
                              <label className="text-xs text-gray-500 uppercase tracking-widest font-bold block mb-3">Operating Address</label>
                              <input value={profile.address} onChange={e => setProfile({ ...profile, address: e.target.value })} placeholder="City, Area" className={inputCls} />
                            </div>
                          </div>
                        )}

                        <div className="pt-8 border-t border-gray-100">
                          <button type="submit" disabled={saving}
                            className="w-full sm:w-auto px-12 py-5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 disabled:opacity-60 transition-colors flex items-center justify-center gap-3">
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                            {saving ? "SAVING..." : "SAVE CHANGES"}
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            )}
          </main>
        </div>
      </div>

      {/* Product modal */}
      <AnimatePresence>
        {modal && (
          <ProductModal product={modal.product} categories={categories}
            onClose={() => setModal(null)} onSave={reloadProducts} />
        )}
      </AnimatePresence>
    </div>
  );
}
