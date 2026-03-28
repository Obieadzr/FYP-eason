import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import API from "../../utils/api";
import {
  Users, Store, Activity, CheckCircle, XCircle, 
  ChevronRight, Box, BarChart3, AlertCircle,
  DollarSign, ShoppingCart, TrendingUp, Calendar, Clock
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// ── Custom Interactive Glowing Area Chart ──
const GlowingAreaChart = ({ data }) => {
  if (!data || data.length === 0) return (
    <div className="h-64 flex items-center justify-center text-gray-500 font-medium tracking-wide">
      Awaiting sufficient data...
    </div>
  );
  
  const max = Math.max(...data.map(d => d.revenue)) * 1.2 || 1000;
  const min = 0;
  
  const pts = data.map((d, i) => {
    const x = (i / (data.length - 1)) * 1000;
    const y = 300 - ((d.revenue - min) / (max - min)) * 300;
    return `${x},${y}`;
  });

  const pathData = `M 0,300 L ${pts.join(" L ")} L 1000,300 Z`;
  const lineData = `M ${pts.join(" L ")}`;

  return (
    <div className="relative w-full h-[320px] mt-6 select-none group">
      <svg viewBox="0 0 1000 300" className="w-full h-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id="neonGreenGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00e87a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00e87a" stopOpacity="0.0" />
          </linearGradient>
          <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
        
        {/* Horizontal Dark Grid lines */}
        {[0, 1, 2, 3].map(i => (
          <line key={i} x1="0" y1={i * 100} x2="1000" y2={i * 100} stroke="#1f2937" strokeWidth="1" strokeDasharray="6 6" />
        ))}

        <motion.path 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          d={pathData} 
          fill="url(#neonGreenGradient)" 
        />
        <motion.path 
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          d={lineData} 
          fill="none" 
          stroke="#00e87a" 
          strokeWidth="4" 
          strokeLinecap="round"
          strokeLinejoin="round"
          filter="url(#neonGlow)"
        />
        
        {/* Data points */}
        {pts.map((pt, i) => {
          const [x, y] = pt.split(',');
          return (
            <g key={i} className="cursor-pointer">
              <motion.circle
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 1 + i * 0.1 }}
                cx={x}
                cy={y}
                r="5"
                fill="#0d0d0d"
                stroke="#00e87a"
                strokeWidth="3"
                className="transition-all duration-300 r-[5px] group-hover:r-[7px]"
                filter="url(#neonGlow)"
              />
              <text 
                x={x} 
                y={Number(y) - 20} 
                fill="#9ca3af" 
                fontSize="12" 
                textAnchor="middle" 
                className="opacity-0 group-hover:opacity-100 transition-opacity font-medium tracking-wide"
              >
                Rs {data[i].revenue.toLocaleString()}
              </text>
            </g>
          );
        })}
      </svg>
      {/* X Axis */}
      <div className="flex justify-between mt-6 px-1">
        {data.map((d, i) => (
          <span key={i} className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">{d.date}</span>
        ))}
      </div>
    </div>
  );
};

// ── Glassmorphic Stat Card ──
const GlassCard = ({ title, value, subtitle, icon: Icon, trend, gradient, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: "easeOut" }}
    className="relative overflow-hidden rounded-[24px] p-6 border border-white/5 bg-[#11131c] shadow-xl group hover:-translate-y-1 transition-all duration-300"
  >
    <div className={`absolute -right-10 -top-10 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity duration-500 bg-gradient-to-br ${gradient}`} />
    
    <div className="flex justify-between items-start mb-6 relative z-10">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br ${gradient} text-white shadow-lg`}>
        <Icon className="w-6 h-6" />
      </div>
      {trend && (
        <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2.5 py-1 rounded-full backdrop-blur-md border border-emerald-400/20">
          <TrendingUp className="w-3.5 h-3.5" /> {trend}
        </span>
      )}
    </div>
    
    <div className="relative z-10">
      <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">{title}</h3>
      <div className="flex items-baseline gap-2">
        <h2 className="text-3xl font-bold text-white tracking-tight">{value}</h2>
        {subtitle && <span className="text-xs font-medium text-gray-400">{subtitle}</span>}
      </div>
    </div>
  </motion.div>
);

const Home = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const [data, setData] = useState(null);
  const [pendingWholesalers, setPendingWholesalers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsRes, pendingRes] = await Promise.all([
          API.get("/admin/analytics"),
          API.get("/admin/pending-wholesalers")
        ]);
        setData(analyticsRes.data);
        setPendingWholesalers(pendingRes.data || []);
      } catch (err) {
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleApprove = async (id) => {
    setApproving(p => ({ ...p, [id]: true }));
    try {
      await API.put(`/admin/approve-wholesaler/${id}`);
      toast.success("Wholesaler approved!");
      setPendingWholesalers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Failed to approve");
    } finally {
      setApproving(p => ({ ...p, [id]: false }));
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm("Reject this application permanently?")) return;
    try {
      await API.delete(`/admin/reject-wholesaler/${id}`);
      toast.success("Application rejected");
      setPendingWholesalers(prev => prev.filter(u => u._id !== id));
    } catch (err) {
      toast.error("Failed to reject");
    }
  };

  // Load fonts dynamically
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@400;500;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => document.head.removeChild(link);
  }, []);

  if (loading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
        <div className="w-12 h-12 border-4 border-[#00e87a] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,232,122,0.5)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white overflow-hidden selection:bg-[#00e87a]/30" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      
      {/* ── Background Ambient Glow ── */}
      <div className="fixed top-0 left-1/4 w-[50vw] h-[50vh] bg-[#00e87a]/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 right-1/4 w-[40vw] h-[40vh] bg-emerald-900/10 rounded-full blur-[120px] pointer-events-none" />
      
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 py-10 lg:px-12">
        
        {/* ── Header ── */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10"
        >
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold text-white tracking-tight leading-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
              Dashboard Overview
            </h1>
            <p className="text-gray-400 font-medium tracking-wide flex items-center gap-2 text-sm uppercase">
              <Calendar className="w-4 h-4 text-[#00e87a]" /> 
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex gap-4">
            <button className="px-6 py-3 bg-[#111111] border border-[#222] rounded-full font-bold text-sm text-gray-300 hover:text-white hover:border-[#00e87a]/50 transition-all">
              Export Report
            </button>
            <button onClick={() => navigate("/dashboard/products/add")} className="px-6 py-3 bg-[#00e87a] text-black rounded-full font-bold text-sm shadow-[0_0_20px_rgba(0,232,122,0.3)] hover:shadow-[0_0_30px_rgba(0,232,122,0.6)] hover:bg-[#00fc85] transition-all flex items-center gap-2">
              <Box className="w-4 h-4" /> Add Product
            </button>
          </div>
        </motion.div>

        {/* ── Stat Cards Grid ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <GlassCard 
            title="Total Revenue" 
            value={`Rs ${data.gmv.toLocaleString()}`} 
            subtitle="Lifetime revenue"
            icon={DollarSign} 
            trend="+18%" 
            gradient="from-[#00e87a] to-emerald-700"
            delay={0.1}
          />
          <GlassCard 
            title="Active Retailers" 
            value={data.users.retailers.toLocaleString()} 
            subtitle={`of ${data.users.total} total`}
            icon={Users} 
            gradient="from-emerald-500 to-teal-700"
            delay={0.2}
          />
          <GlassCard 
            title="Wholesalers" 
            value={data.users.wholesalers.toLocaleString()} 
            icon={Store} 
            gradient="from-green-400 to-[#00e87a]"
            delay={0.3}
          />
          <GlassCard 
            title="Total Orders" 
            value={data.orders.toLocaleString()} 
            icon={ShoppingCart} 
            gradient="from-[#00e87a] to-green-600"
            delay={0.4}
          />
        </div>

        {/* ── Main Dashboard Content Grid ── */}
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Left Column: Live Chart & Recent Transactions */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Live SVG Chart */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-[#111111] rounded-[24px] p-8 border border-[#222] shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-1/4 w-[300px] h-[300px] bg-[#00e87a]/5 rounded-full blur-3xl opacity-50 mix-blend-screen pointer-events-none" />
              
              <div className="flex items-center justify-between mb-4 relative z-10">
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                    Revenue Trend <span className="w-2 h-2 rounded-full bg-[#00e87a] animate-pulse shadow-[0_0_8px_#00e87a]"></span>
                  </h2>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/5 flex items-center gap-2 text-sm font-semibold text-[#00e87a]">
                  <Calendar className="w-4 h-4" /> This Week
                </div>
              </div>
              <GlowingAreaChart data={data.revenueData} />
            </motion.div>

            {/* Recent Orders Table */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#111111] rounded-[24px] border border-[#222] shadow-2xl overflow-hidden"
            >
              <div className="p-8 pb-6 flex items-center justify-between border-b border-[#222]">
                <h2 className="text-xl font-bold text-white tracking-tight" style={{ fontFamily: "'Syne', sans-serif" }}>Recent Orders</h2>
                <button className="text-xs font-bold text-[#00e87a] hover:text-[#00fc85] uppercase tracking-widest flex items-center gap-1 transition-colors">
                  View All <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="py-4 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">Hash ID</th>
                      <th className="py-4 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">Node (Retailer)</th>
                      <th className="py-4 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5">State</th>
                      <th className="py-4 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest border-b border-white/5 text-right">Volume</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {data.recentOrders?.map((order, i) => (
                      <motion.tr 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7 + (i * 0.1) }}
                        key={order._id} 
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        <td className="py-5 px-8 text-sm font-mono text-[#00e87a]">#{order._id.slice(-6).toUpperCase()}</td>
                        <td className="py-5 px-8">
                          <p className="text-sm font-bold text-white">{order.retailer?.firstName} {order.retailer?.lastName}</p>
                          <p className="text-xs font-medium text-gray-500">{order.retailer?.email}</p>
                        </td>
                        <td className="py-5 px-8">
                          <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border
                            ${order.status === 'delivered' ? 'bg-[#00e87a]/10 text-[#00e87a] border-[#00e87a]/20' : 
                              order.status === 'processing' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${order.status === 'delivered' ? 'bg-[#00e87a] shadow-[0_0_8px_#00e87a]' : order.status === 'processing' ? 'bg-orange-400 shadow-[0_0_8px_#f97316]' : 'bg-red-500'}`} />
                            {order.status}
                          </span>
                        </td>
                        <td className="py-5 px-8 text-right text-sm font-bold text-white tabular-nums">
                          Rs {(order.grandTotal || order.totalAmount || 0).toLocaleString()}
                        </td>
                      </motion.tr>
                    ))}
                    {(!data.recentOrders || data.recentOrders.length === 0) && (
                      <tr>
                        <td colSpan="4" className="py-12 text-center text-gray-500 text-sm font-medium tracking-wide">Ledger is empty.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>

          </div>

          {/* Right Column: Alerts & Controls */}
          <div className="space-y-8">
            
            {/* Action Required: Pending Wholesalers */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-[#111111] rounded-[24px] p-8 border border-[#222] shadow-2xl relative overflow-hidden"
            >
              <div className="relative z-10 flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Pending Verifications</h2>
                </div>
                <div className="w-10 h-10 rounded-full bg-[#00e87a]/10 flex items-center justify-center border border-[#00e87a]/20">
                  <Clock className="w-5 h-5 text-[#00e87a]" />
                </div>
              </div>

              {pendingWholesalers.length === 0 ? (
                <div className="py-10 text-center relative z-10 bg-[#0d0d0d] rounded-2xl border border-[#222]">
                  <CheckCircle className="w-10 h-10 text-[#00e87a] mx-auto mb-3" />
                  <p className="text-gray-400 font-medium text-sm">All caught up! No pending applications.</p>
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  <AnimatePresence>
                    {pendingWholesalers.map((app) => (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        key={app._id} 
                        className="bg-[#0d0d0d] border border-[#222] hover:border-[#00e87a]/50 transition-colors rounded-2xl p-5"
                      >
                        <div className="mb-4">
                          <p className="font-bold text-white tracking-wide">{app.firstName} {app.lastName}</p>
                          <p className="text-xs text-[#00e87a] font-medium tracking-wide mt-1">{app.email}</p>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleApprove(app._id)}
                            disabled={approving[app._id]}
                            className="flex-1 py-2.5 bg-[#00e87a] hover:bg-[#00fc85] text-black rounded-xl text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50"
                          >
                            {approving[app._id] ? "Processing..." : "Approve"}
                          </button>
                          <button 
                            onClick={() => handleReject(app._id)}
                            className="flex-1 py-2.5 bg-[#111] hover:bg-red-500/20 hover:text-red-400 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors border border-[#222]"
                          >
                            Deny
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>

            {/* System Status Mini Widget */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.7 }}
              className="bg-[#111111] rounded-[24px] p-8 border border-[#222] shadow-2xl"
            >
              <h2 className="text-lg font-bold text-white tracking-tight mb-6" style={{ fontFamily: "'Syne', sans-serif" }}>Platform Health</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00e87a]/10 border border-[#00e87a]/20 flex items-center justify-center shrink-0">
                    <Activity className="w-5 h-5 text-[#00e87a]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">Servers Operating Normally</h4>
                    <p className="text-xs font-medium text-gray-500 mt-1">99.9% uptime</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#00e87a]/10 border border-[#00e87a]/20 flex items-center justify-center shrink-0">
                    <AlertCircle className="w-5 h-5 text-[#00e87a]" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-200">{data.products.toLocaleString()} Products Synced</h4>
                    <p className="text-xs font-medium text-gray-500 mt-1">Catalog status nominal</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
