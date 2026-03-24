// src/pages/auth/Profile.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Package, TrendingUp, Settings,
  LogOut, CheckCircle2, Boxes, AlertTriangle, ShoppingBag,
  Search, Plus, Edit3, Trash2, Loader2
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import API from "../../utils/api";
import toast from "react-hot-toast";
import Navbar from "../../components/layout/Navbar";

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

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [tab, setTab] = useState("overview"); 
  const isWholesaler = user?.role === "wholesaler";

  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    const load = async () => {
      try {
        const orderRes = await API.get(isWholesaler ? "/orders/wholesaler" : "/orders/my-orders").catch(() => ({ data: [] }));
        setOrders(orderRes.data?.orders || orderRes.data || []);
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

  const tabs = isWholesaler
    ? [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "products", label: "Products", icon: Package },
        { id: "orders", label: "Sales", icon: TrendingUp },
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

  if (!user || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent flex rounded-full animate-spin" />
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
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard icon={Package} label="Total Products" value={products.length} />
                    <StatCard icon={Boxes} label="Total Stock" value={totalStock} />
                    <StatCard icon={ShoppingBag} label="Orders This Month" value={ordersThisMonth} />
                    <StatCard icon={AlertTriangle} label="Low Stock Items" value={lowStockItems} alert={lowStockItems > 0} />
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
                        onClick={() => navigate("/add-product")}
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
                        onClick={() => navigate("/add-product")}
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
                                      onClick={() => navigate(`/add-product?edit=${p._id}`)}
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
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {orders.map(o => (
                              <tr key={o._id} className="hover:bg-gray-50 transition cursor-pointer" onClick={() => navigate(isWholesaler ? `/orders/kanban` : `/order-success?orderId=${o._id}&total=${o.totalAmount || o.total || 0}`)}>
                                <td className="py-4 px-6 font-medium text-gray-900">#{o._id?.slice(-8).toUpperCase()}</td>
                                <td className="py-4 px-6 text-sm text-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                                <td className="py-4 px-6 text-sm text-gray-600">{o.items?.length || 0} items</td>
                                <td className="py-4 px-6 font-bold text-gray-900">Rs {Number(o.totalAmount || o.total || 0).toLocaleString()}</td>
                                <td className="py-4 px-6">{getStatusBadge(o.status)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
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
    </div>
  );
}
