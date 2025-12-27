// src/pages/dashboard/Home.jsx
import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import API from "../../utils/api";
import { Package, Layers, AlertTriangle, Plus, ArrowRight, Activity, Clock, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    categories: 0,
    totalStock: 0,
    lowStock: 0,
  });
  const [pendingWholesalers, setPendingWholesalers] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingPending, setLoadingPending] = useState(true);
  const [approving, setApproving] = useState({});

  const LOW_STOCK_THRESHOLD = 10;

  // Fetch product stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await API.get("/products");
        const products = Array.isArray(res.data) ? res.data : res.data?.products || [];

        const uniqueCategories = new Set(
          products
            .map(p => p.category?._id || p.category)
            .filter(Boolean)
        ).size;

        const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
        const lowStock = products.filter(p => (p.stock || 0) < LOW_STOCK_THRESHOLD).length;

        setStats({
          products: products.length,
          categories: uniqueCategories,
          totalStock,
          lowStock,
        });
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  // Fetch pending wholesalers (only for admin)
  useEffect(() => {
    if (user?.role === "admin") {
      const fetchPending = async () => {
        try {
          const res = await API.get("/admin/pending-wholesalers");
          setPendingWholesalers(res.data || []);
        } catch (err) {
          toast.error("Failed to load pending applications");
        } finally {
          setLoadingPending(false);
        }
      };
      fetchPending();
    }
  }, [user]);

  const handleApprove = async (id) => {
    setApproving(prev => ({ ...prev, [id]: true }));
    try {
      await API.put(`/admin/approve-wholesaler/${id}`);
      toast.success("Wholesaler approved!");
      setPendingWholesalers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Failed to approve");
    } finally {
      setApproving(prev => ({ ...prev, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject and delete this application?")) return;
    try {
      await API.delete(`/admin/reject-wholesaler/${id}`);
      toast.success("Application rejected");
      setPendingWholesalers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  if (loadingStats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-2 border-gray-300 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="max-w-7xl mx-auto px-5 py-8 lg:px-8 lg:py-10">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
            Welcome back, <span className="text-emerald-600">{user?.fullName?.split(" ")[0] || "Admin"}</span>
          </h1>
          <p className="mt-1.5 text-gray-600">Inventory overview • {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {[
            { label: "Total Products", value: stats.products, icon: Package },
            { label: "Categories", value: stats.categories, icon: Layers },
            { label: "Total Stock", value: stats.totalStock.toLocaleString(), icon: Package },
            { label: "Low Stock Items", value: stats.lowStock, icon: AlertTriangle, critical: true },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className={`bg-white rounded-xl p-6 border ${
                stat.critical && stat.value > 0 
                  ? "border-red-200 shadow-red-100/50 shadow-lg" 
                  : "border-gray-200"
              } hover:shadow-lg transition-shadow duration-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.label}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.critical && stat.value > 0 ? "bg-red-50 text-red-600" : "bg-indigo-50 text-emerald-600"
                }`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              {stat.critical && stat.value > 0 && (
                <p className="mt-3 text-xs font-semibold text-red-600">
                  Below {LOW_STOCK_THRESHOLD} units • Needs restock
                </p>
              )}
            </motion.div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Manage Inventory */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-2 bg-white rounded-xl border border-gray-200 p-7"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Manage Inventory</h2>
                <p className="text-gray-600">
                  {stats.products} active product{stats.products !== 1 ? "s" : ""}
                </p>
              </div>
              <Activity className="w-9 h-9 text-gray-300" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => navigate("/dashboard/products/add")}
                className="group flex items-center justify-between p-5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-all"
              >
                <div className="flex items-center gap-4">
                  <Plus className="w-5 h-5" />
                  <div className="text-left">
                    <p className="font-semibold">Add New Product</p>
                    <p className="text-xs opacity-80">Quickly expand catalog</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition" />
              </button>

              <button
                onClick={() => navigate("/dashboard/products")}
                className="group flex items-center justify-between p-5 border border-gray-300 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-center gap-4">
                  <Package className="w-5 h-5 text-gray-700" />
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">View All Products</p>
                    <p className="text-xs text-gray-600">Update stock & details</p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-500 group-hover:translate-x-1 transition" />
              </button>
            </div>
          </motion.div>

          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.35 }}
            className="bg-white rounded-xl border border-gray-200 p-6"
          >
            <h3 className="font-semibold text-gray-900 mb-5">Recent Activity</h3>
            <div className="space-y-4">
              {[
                { text: "Dashboard loaded", time: "Just now" },
                { text: `${stats.products} product${stats.products !== 1 ? "s" : ""} synced`, time: "1 min ago" },
                { text: "Inventory check complete", time: "2 min ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.text}</p>
                    <p className="text-xs text-gray-500">{item.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Admin Only: Pending Wholesalers Section */}
        {user?.role === "admin" && (
          <div className="mt-12">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Clock className="w-7 h-7 text-orange-500" />
                Pending Wholesaler Applications ({pendingWholesalers.length})
              </h2>

              {loadingPending ? (
                <p className="text-gray-500">Loading applications...</p>
              ) : pendingWholesalers.length === 0 ? (
                <p className="text-gray-500 text-center py-12">
                  No pending applications 🎉 All wholesalers are verified!
                </p>
              ) : (
                <div className="space-y-4">
                  {pendingWholesalers.map((applicant) => (
                    <div
                      key={applicant._id}
                      className="flex items-center justify-between p-6 bg-gray-50 rounded-xl border border-gray-200"
                    >
                      <div>
                        <p className="text-lg font-semibold">
                          {applicant.firstName} {applicant.lastName}
                        </p>
                        <p className="text-gray-600">{applicant.email}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Applied on {new Date(applicant.createdAt).toLocaleDateString()}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleApprove(applicant._id)}
                          disabled={approving[applicant._id]}
                          className="px-5 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-70 transition flex items-center gap-2"
                        >
                          <CheckCircle className="w-5 h-5" />
                          {approving[applicant._id] ? "Approving..." : "Approve"}
                        </button>

                        <button
                          onClick={() => handleReject(applicant._id)}
                          className="px-5 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition flex items-center gap-2"
                        >
                          <XCircle className="w-5 h-5" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;