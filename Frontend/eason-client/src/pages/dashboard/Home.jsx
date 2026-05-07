import React, { useEffect, useState } from "react";
import { useAuthStore } from "../../store/authStore";
import API from "../../utils/api";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, TrendingUp, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const FONT = "'DM Sans', 'Inter', system-ui, sans-serif";
const BG = "#0a0a0a";
const PANEL = "rgba(255,255,255,0.04)";
const BORDER = "1px solid rgba(255,255,255,0.07)";
const MUTED = "rgba(255,255,255,0.4)";
const ACCENT = "#8b5cf6";
const GREEN = "#22c55e";

/* ── Tiny sparkline for revenue hero ── */
function MiniSparkline({ data = [], color = ACCENT }) {
  if (!data || data.length < 2) return null;
  const vals = data.map(d => d.revenue || 0);
  const max = Math.max(...vals) || 1;
  const W = 200, H = 40;
  const pts = vals.map((v, i) => {
    const x = (i / (vals.length - 1)) * W;
    const y = H - (v / max) * H * 0.85;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block" }}>
      <defs>
        <linearGradient id="sg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.2" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`M 0,${H} L ${pts} L ${W},${H} Z`} fill="url(#sg)" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Dual-line area chart for analytics panel ── */
function AreaChart({ data = [] }) {
  if (!data || data.length < 2) return (
    <div style={{ height: 140, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 13 }}>
      No data yet
    </div>
  );
  const revenues = data.map(d => d.revenue || 0);
  const max = Math.max(...revenues) * 1.25 || 1000;
  const W = 1000, H = 130;
  const pts = revenues.map((v, i) => {
    const x = (i / (revenues.length - 1)) * W;
    const y = H - (v / max) * H * 0.85;
    return `${x},${y}`;
  });
  const ptStr = pts.join(" L ");
  const expPts = revenues.map((v, i) => {
    const x = (i / (revenues.length - 1)) * W;
    const y = H - (v * 0.72 / max) * H * 0.85;
    return `${x},${y}`;
  }).join(" L ");
  const step = data.length > 8 ? Math.ceil(data.length / 6) : 1;
  return (
    <div>
      <div style={{ display: "flex", gap: 16, marginBottom: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 2, background: "#b8f053", display: "inline-block", borderRadius: 2 }} />
          <span style={{ fontSize: 11, color: MUTED }}>Income</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ width: 10, height: 2, background: "rgba(255,255,255,0.25)", display: "inline-block", borderRadius: 2, borderTop: "2px dashed rgba(255,255,255,0.25)" }} />
          <span style={{ fontSize: 11, color: MUTED }}>Expenses</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: 130 }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="ag1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b8f053" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#b8f053" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75, 1].map((p, i) => (
          <line key={i} x1="0" y1={H * p} x2={W} y2={H * p} stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        ))}
        <motion.path
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}
          d={`M 0,${H} L ${ptStr} L ${W},${H} Z`} fill="url(#ag1)"
        />
        <motion.path
          initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.2, ease: "easeInOut" }}
          d={`M ${ptStr}`} fill="none" stroke="#b8f053" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        />
        <path d={`M ${expPts}`} fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1.5" strokeDasharray="6 4" strokeLinecap="round" />
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
        {data.map((d, i) => {
          if (i % step !== 0 && i !== data.length - 1) return <span key={i} />;
          return <span key={i} style={{ fontSize: 10, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>{d.date}</span>;
        })}
      </div>
    </div>
  );
}

/* ── Donut chart for order status ── */
function DonutChart({ data = [] }) {
  const COLORS = { pending: "#f59e0b", accepted: "#3b82f6", processing: ACCENT, shipped: "#06b6d4", delivered: GREEN, cancelled: "#ef4444" };
  const total = data.reduce((a, d) => a + d.count, 0);
  if (!total) return <div style={{ height: 100, display: "flex", alignItems: "center", justifyContent: "center", color: MUTED, fontSize: 12 }}>No orders yet</div>;
  let cum = 0;
  const segs = data.filter(d => d.count > 0).map(d => {
    const s = cum; cum += d.count / total;
    return { ...d, s, e: cum, color: COLORS[d.status] || "#6b7280" };
  });
  const gc = p => { const a = p * 2 * Math.PI - Math.PI / 2; return { x: 50 + 38 * Math.cos(a), y: 50 + 38 * Math.sin(a) }; };
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg viewBox="0 0 100 100" style={{ width: 100, height: 100, flexShrink: 0 }}>
        {segs.map((seg, i) => {
          const s = gc(seg.s), e = gc(seg.e);
          return <path key={i} d={`M 50 50 L ${s.x} ${s.y} A 38 38 0 ${(seg.e - seg.s) > 0.5 ? 1 : 0} 1 ${e.x} ${e.y} Z`} fill={seg.color} opacity={0.85} />;
        })}
        <circle cx="50" cy="50" r="26" fill={BG} />
        <text x="50" y="47" textAnchor="middle" fill="#fff" fontSize="9" fontWeight="600">{total}</text>
        <text x="50" y="56" textAnchor="middle" fill="rgba(255,255,255,0.4)" fontSize="6">orders</text>
      </svg>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 7 }}>
        {segs.map((d, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: MUTED, textTransform: "capitalize" }}>{d.status}</span>
            </div>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#fff" }}>{d.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const { user } = useAuthStore();
  const nav = useNavigate();
  const [data, setData] = useState(null);
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState({});
  const [range, setRange] = useState("7D");

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    (async () => {
      try {
        const [a, p] = await Promise.all([API.get("/admin/analytics"), API.get("/admin/pending-wholesalers")]);
        setData(a.data); setPending(p.data || []);
      } catch { toast.error("Failed to load dashboard"); }
      finally { setLoading(false); }
    })();
    return () => { try { document.head.removeChild(link); } catch {} };
  }, []);

  const approve = async id => {
    setApproving(p => ({ ...p, [id]: true }));
    try { await API.put(`/admin/approve-wholesaler/${id}`); toast.success("Approved"); setPending(p => p.filter(u => u._id !== id)); }
    catch { toast.error("Failed"); }
    finally { setApproving(p => ({ ...p, [id]: false })); }
  };
  const reject = async id => {
    if (!window.confirm("Reject permanently?")) return;
    try { await API.delete(`/admin/reject-wholesaler/${id}`); toast.success("Rejected"); setPending(p => p.filter(u => u._id !== id)); }
    catch { toast.error("Failed"); }
  };

  if (loading || !data) return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
      <div style={{ width: 36, height: 36, border: "2px solid rgba(139,92,246,0.3)", borderTopColor: ACCENT, borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
      <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
    </div>
  );

  const firstName = user?.firstName || user?.fullName?.split(" ")[0] || "Admin";
  const chartData = range === "7D" ? data.revenueData : (data.monthlyRevenue || data.revenueData);
  const gmv = data.gmv || 0;
  const commission = Math.round(gmv * 0.025);
  const R = data.users.retailers || 0;
  const W = data.users.wholesalers || 0;
  const T = (R + W) || 1;
  const rPct = Math.round((R / T) * 100);
  const wPct = Math.round((W / T) * 100);
  const avgOrder = Math.round(gmv / Math.max(data.orders, 1));

  const P = { fontFamily: FONT, padding: "24px 32px", maxWidth: 1400, margin: "0 auto" };
  const card = { background: PANEL, border: BORDER, borderRadius: 16, padding: "20px 24px" };

  return (
    <div style={{ minHeight: "100vh", background: BG, fontFamily: FONT, color: "#fff" }}>
      <div style={P}>

        {/* Welcome row */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <p style={{ fontSize: 12, color: MUTED, margin: "0 0 4px", letterSpacing: "0.05em", textTransform: "uppercase" }}>Welcome back,</p>
            <h1 style={{ fontSize: 38, fontWeight: 600, margin: 0, letterSpacing: "-0.03em", color: "#fff" }}>
              {firstName}<span style={{ color: MUTED, fontWeight: 300 }}> — {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</span>
            </h1>
          </div>
          <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.05)", border: BORDER, borderRadius: 24, padding: "4px 6px" }}>
            {[["7D","Week"],["30D","Month"],["90D","Year"]].map(([v, l]) => (
              <button key={v} onClick={() => setRange(v)} style={{ padding: "5px 16px", borderRadius: 20, fontSize: 12, fontWeight: range === v ? 600 : 400, color: range === v ? "#fff" : MUTED, background: range === v ? "rgba(255,255,255,0.1)" : "transparent", border: "none", cursor: "pointer", transition: "all 0.15s" }}>{l}</button>
            ))}
          </div>
        </div>

        {/* ── Hero Panel: 5-col grid ── */}
        <div style={{ display: "grid", gridTemplateColumns: "27fr 1px 27fr 1px 46fr", background: "rgba(255,255,255,0.04)", borderRadius: 16, overflow: "hidden", marginBottom: 20 }}>

          {/* Col 1 — Revenue */}
          <div style={{ padding: "28px 28px 28px 32px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 12px" }}>Total Revenue</p>
            <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", marginBottom: 8 }}>
              <span style={{ fontSize: "clamp(28px,3vw,44px)", fontWeight: 700, color: "#fff", letterSpacing: "-0.03em", lineHeight: 1 }}>Rs {gmv.toLocaleString()}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#bbf7d0", background: "#16a34a", borderRadius: 6, padding: "3px 8px", flexShrink: 0 }}>↑ 12.67%</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: "0 0 3px" }}>Available GMV: <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 500 }}>Rs {gmv.toLocaleString()}</span></p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", margin: "0 0 18px" }}>Platform earning: <span style={{ color: "rgba(255,255,255,0.55)" }}>Rs {commission.toLocaleString()}</span> (2.5% commission)</p>
            {/* Sparkline — purple line, no fill */}
            <svg viewBox="0 0 300 60" style={{ width: "100%", height: 60 }} preserveAspectRatio="none">
              <path d="M 0,50 C 30,48 50,20 80,18 C 110,16 130,40 160,35 C 190,30 210,10 240,12 C 265,14 280,38 300,36" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Divider 1 */}
          <div style={{ background: "rgba(255,255,255,0.08)", margin: "24px 0" }} />

          {/* Col 2 — Stats */}
          <div style={{ padding: "28px" }}>
            {[
              { label: "Active Retailers", value: R, pct: rPct, color: "#b8f053" },
              { label: "Wholesalers",      value: W, pct: wPct, color: "#8b5cf6" },
              { label: "Avg Order Value",  value: `Rs ${avgOrder.toLocaleString()}`, pct: Math.min(Math.round((avgOrder / 50000) * 100), 100), color: "#3b82f6" },
            ].map(({ label, value, pct, color }, i, arr) => (
              <div key={label} style={{ paddingTop: i === 0 ? 0 : 16, paddingBottom: i === arr.length - 1 ? 0 : 16, borderBottom: i < arr.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{value}</span>
                </div>
                <div style={{ height: 3, background: "rgba(255,255,255,0.08)", borderRadius: 2 }}>
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 0.9, ease: "easeOut" }}
                    style={{ height: "100%", background: color, borderRadius: 2 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Divider 2 */}
          <div style={{ background: "rgba(255,255,255,0.08)", margin: "24px 0" }} />

          {/* Col 3 — Order Pipeline */}
          <div style={{ padding: "28px 32px 28px 28px" }}>
            <p style={{ fontSize: 10, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.12em", margin: "0 0 16px" }}>Order Pipeline</p>
            {(() => {
              const breakdown = data.orderStatusBreakdown || [];
              const statusMap = { pending: { color: "#f59e0b", bg: "rgba(245,158,11,0.15)", label: "Pending" }, processing: { color: "#8b5cf6", bg: "rgba(139,92,246,0.15)", label: "Processing" }, shipped: { color: "#3b82f6", bg: "rgba(59,130,246,0.15)", label: "Shipped" }, delivered: { color: "#22c55e", bg: "rgba(34,197,94,0.15)", label: "Delivered" }, accepted: { color: "#06b6d4", bg: "rgba(6,182,212,0.15)", label: "Accepted" }, cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.15)", label: "Cancelled" } };
              const rows = breakdown.filter(d => d.count > 0).slice(0, 5);
              const total = rows.reduce((a, d) => a + d.count, 0) || 1;
              return (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {rows.map(d => {
                      const s = statusMap[d.status] || { color: "#9ca3af", bg: "rgba(156,163,175,0.15)", label: d.status };
                      return (
                        <div key={d.status} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.color, flexShrink: 0 }} />
                            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.75)", fontWeight: 400 }}>{s.label}</span>
                          </div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: s.color, background: s.bg, padding: "2px 10px", borderRadius: 12 }}>{d.count}</span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Multi-segment bar */}
                  <div style={{ display: "flex", height: 6, borderRadius: 3, overflow: "hidden", gap: 1 }}>
                    {rows.map(d => {
                      const s = statusMap[d.status] || { color: "#9ca3af" };
                      return <div key={d.status} style={{ flex: d.count, background: s.color, minWidth: 2 }} />;
                    })}
                  </div>
                </>
              );
            })()}
          </div>
        </div>

        {/* 3-col analytics */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>

          {/* Analytics area chart */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#fff", letterSpacing: "-0.01em" }}>Analytics</h2>
              <div style={{ display: "flex", gap: 3, background: "rgba(255,255,255,0.04)", border: BORDER, borderRadius: 12, padding: 3 }}>
                {[["7D","W"],["30D","M"]].map(([v,l]) => (
                  <button key={v} onClick={() => setRange(v)} style={{ padding: "3px 10px", borderRadius: 8, fontSize: 11, fontWeight: 600, color: range===v?"#fff":MUTED, background: range===v?ACCENT:"transparent", border:"none",cursor:"pointer",transition:"all 0.15s"}}>{l}</button>
                ))}
              </div>
            </div>
            <AreaChart data={chartData} />
          </div>

          {/* Order status donut */}
          <div style={card}>
            <h2 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 16px", color: "#fff" }}>Order Status</h2>
            <DonutChart data={data.orderStatusBreakdown || []} />
            {data.categoryBreakdown?.length > 0 && (
              <>
                <div style={{ height: 1, background: "rgba(255,255,255,0.06)", margin: "16px 0" }} />
                <p style={{ fontSize: 11, color: MUTED, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Category Revenue</p>
                {data.categoryBreakdown.slice(0, 3).map((cat, i) => {
                  const pct = Math.round((cat.revenue / (data.categoryBreakdown[0].revenue || 1)) * 100);
                  return (
                    <div key={i} style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: "#fff" }}>{cat.name}</span>
                        <span style={{ fontSize: 10, color: MUTED }}>Rs {cat.revenue.toLocaleString()}</span>
                      </div>
                      <div style={{ height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 3 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: ACCENT, borderRadius: 3 }} />
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Recent transactions/orders */}
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: BORDER, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#fff" }}>Recent Orders</h2>
              <button onClick={() => nav("/orders/kanban")} style={{ fontSize: 11, color: MUTED, background: "none", border: "none", cursor: "pointer" }}>View all →</button>
            </div>
            <div>
              {data.recentOrders?.slice(0, 5).map((order, i) => {
                const SC = { delivered: GREEN, processing: "#f59e0b", shipped: "#3b82f6", cancelled: "#ef4444" };
                const sc = SC[order.status] || MUTED;
                return (
                  <div key={order._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: i < 4 ? BORDER : "none" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 500, color: "#fff", margin: "0 0 2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {order.user?.firstName} {order.user?.lastName}
                      </p>
                      <p style={{ fontSize: 11, color: MUTED, margin: 0 }}>#{order._id.slice(-6).toUpperCase()}</p>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                      <span style={{ fontSize: 10, fontWeight: 600, color: sc, background: sc + "20", padding: "2px 8px", borderRadius: 12, textTransform: "capitalize" }}>{order.status}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: order.status === "cancelled" ? "#ef4444" : "#fff", minWidth: 60, textAlign: "right" }}>
                        Rs {(order.grandTotal || order.totalAmount || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(!data.recentOrders || data.recentOrders.length === 0) && (
                <div style={{ padding: 24, textAlign: "center", fontSize: 12, color: MUTED }}>No orders yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom row: pending + top products */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 16 }}>

          {/* Pending KYC */}
          <div style={card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#fff" }}>Pending KYC</h2>
              {pending.length > 0 && <span style={{ fontSize: 11, color: "#f59e0b", background: "rgba(245,158,11,0.1)", padding: "2px 8px", borderRadius: 12, fontWeight: 600 }}>{pending.length}</span>}
            </div>
            {pending.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <CheckCircle style={{ width: 24, height: 24, color: GREEN, margin: "0 auto 8px" }} />
                <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>All caught up!</p>
              </div>
            ) : (
              <AnimatePresence>
                {pending.slice(0, 4).map(app => (
                  <motion.div key={app._id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}
                    style={{ padding: "12px 0", borderBottom: BORDER }}>
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#fff", margin: "0 0 2px" }}>{app.firstName} {app.lastName}</p>
                    <p style={{ fontSize: 11, color: MUTED, margin: "0 0 8px" }}>{app.email}</p>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => approve(app._id)} disabled={approving[app._id]} style={{ flex: 1, padding: "6px", background: ACCENT, color: "#fff", border: "none", borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer", opacity: approving[app._id] ? 0.5 : 1 }}>
                        {approving[app._id] ? "…" : "Approve"}
                      </button>
                      <button onClick={() => reject(app._id)} style={{ flex: 1, padding: "6px", background: "transparent", color: MUTED, border: BORDER, borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: "pointer" }}
                        onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#ef4444"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = MUTED; }}>
                        Deny
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* Top products */}
          {data.topProducts?.length > 0 && (
            <div style={{ ...card, padding: 0, overflow: "hidden" }}>
              <div style={{ padding: "16px 20px", borderBottom: BORDER }}>
                <h2 style={{ fontSize: 14, fontWeight: 600, margin: 0, color: "#fff" }}>Top Products <span style={{ fontSize: 12, color: MUTED, fontWeight: 400 }}>(Last 30 days)</span></h2>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.02)" }}>
                    {["#","Product","Category","Sold","Revenue"].map(h => (
                      <th key={h} style={{ padding: "10px 16px", fontSize: 10, fontWeight: 600, color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em", textAlign: ["Sold","Revenue"].includes(h) ? "right" : "left", borderBottom: BORDER }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.topProducts.slice(0, 5).map((p, i) => (
                    <tr key={p.productId} style={{ borderBottom: BORDER }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.02)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "10px 16px", fontSize: 11, fontWeight: 700, color: i === 0 ? "#f59e0b" : i === 1 ? "rgba(255,255,255,0.6)" : MUTED }}>#{i + 1}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <img src={`http://localhost:5000${p.image}`} alt={p.name} style={{ width: 28, height: 28, borderRadius: 6, objectFit: "cover", background: "rgba(255,255,255,0.06)", border: BORDER }} />
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#fff" }}>{p.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 11, color: MUTED }}>{p.category}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 500, color: MUTED, textAlign: "right" }}>{p.unitsSold}</td>
                      <td style={{ padding: "10px 16px", fontSize: 12, fontWeight: 600, color: GREEN, textAlign: "right" }}>Rs {p.totalRevenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
