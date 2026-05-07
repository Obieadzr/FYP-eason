import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Truck, Package, CheckCircle2, Clock, XCircle,
  ChevronDown, ChevronUp, RefreshCw, MapPin, Phone,
  Filter, Search, Edit2, Save, X
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../utils/api";

// ── Partner config ──────────────────────────────────────────────────────────
const PARTNERS = {
  eas_internal: { label: "eAson Internal", color: "#00e87a", bg: "rgba(0,232,122,0.12)", border: "rgba(0,232,122,0.3)" },
  pathao:       { label: "Pathao",          color: "#3b82f6", bg: "rgba(59,130,246,0.12)", border: "rgba(59,130,246,0.3)" },
  daraz:        { label: "Daraz",           color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.3)" },
};

const SHIPMENT_STATUSES = {
  assigned:         { label: "Assigned",          color: "#f59e0b" },
  picked_up:        { label: "Picked Up",         color: "#3b82f6" },
  in_transit:       { label: "In Transit",        color: "#8b5cf6" },
  out_for_delivery: { label: "Out for Delivery",  color: "#06b6d4" },
  delivered:        { label: "Delivered",         color: "#00e87a" },
  failed:           { label: "Failed",            color: "#ef4444" },
};

// ── Partner badge ───────────────────────────────────────────────────────────
const PartnerBadge = ({ partner }) => {
  const p = PARTNERS[partner] || PARTNERS.eas_internal;
  return (
    <span
      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
      style={{ color: p.color, background: p.bg, border: `1px solid ${p.border}` }}
    >
      {p.label}
    </span>
  );
};

// ── Status badge ────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const s = SHIPMENT_STATUSES[status] || { label: status, color: "#9ca3af" };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full"
      style={{ color: s.color, background: s.color + "18", border: `1px solid ${s.color}30` }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color, boxShadow: `0 0 6px ${s.color}` }} />
      {s.label}
    </span>
  );
};

// ── Status History Timeline ─────────────────────────────────────────────────
const Timeline = ({ history }) => (
  <div className="mt-4 pl-4 border-l-2 border-white/10 space-y-3">
    {history?.map((h, i) => {
      const s = SHIPMENT_STATUSES[h.status] || { label: h.status, color: "#9ca3af" };
      return (
        <div key={i} className="relative">
          <span
            className="absolute -left-[17px] top-1 w-3 h-3 rounded-full border-2 border-[#0d0d0d]"
            style={{ background: s.color }}
          />
          <p className="text-xs font-bold" style={{ color: s.color }}>{s.label}</p>
          {h.note && <p className="text-[10px] text-gray-500 mt-0.5">{h.note}</p>}
          <p className="text-[9px] text-gray-600 mt-0.5">
            {new Date(h.timestamp).toLocaleString("en-US", {
              month: "short", day: "numeric", hour: "2-digit", minute: "2-digit"
            })}
          </p>
        </div>
      );
    })}
  </div>
);

// ── Edit Form ───────────────────────────────────────────────────────────────
function EditShipmentForm({ shipment, onSave, onCancel }) {
  const [form, setForm] = useState({
    partner:           shipment.partner || "eas_internal",
    riderName:         shipment.riderName || "",
    riderPhone:        shipment.riderPhone || "",
    estimatedDelivery: shipment.estimatedDelivery
      ? new Date(shipment.estimatedDelivery).toISOString().slice(0, 16)
      : "",
    status: shipment.status || "assigned",
    note:   "",
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(form);
    } finally {
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      className="overflow-hidden"
    >
      <div className="mt-4 p-5 rounded-2xl bg-white/[0.03] border border-white/10 grid grid-cols-2 gap-4">
        {/* Partner */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Partner</label>
          <select
            value={form.partner}
            onChange={e => setForm(p => ({ ...p, partner: e.target.value }))}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e87a]/50"
          >
            <option value="eas_internal">eAson Internal</option>
            <option value="pathao">Pathao</option>
            <option value="daraz">Daraz</option>
          </select>
        </div>
        {/* Status */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Shipment Status</label>
          <select
            value={form.status}
            onChange={e => setForm(p => ({ ...p, status: e.target.value }))}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e87a]/50"
          >
            {Object.entries(SHIPMENT_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
        {/* Rider name */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Rider Name</label>
          <input
            value={form.riderName}
            onChange={e => setForm(p => ({ ...p, riderName: e.target.value }))}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e87a]/50"
            placeholder="e.g. Aarav Sharma"
          />
        </div>
        {/* Rider phone */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Rider Phone</label>
          <input
            value={form.riderPhone}
            onChange={e => setForm(p => ({ ...p, riderPhone: e.target.value }))}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e87a]/50"
            placeholder="98XXXXXXXX"
          />
        </div>
        {/* ETA */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Estimated Delivery</label>
          <input
            type="datetime-local"
            value={form.estimatedDelivery}
            onChange={e => setForm(p => ({ ...p, estimatedDelivery: e.target.value }))}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e87a]/50"
          />
        </div>
        {/* Note */}
        <div>
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">Status Note</label>
          <input
            value={form.note}
            onChange={e => setForm(p => ({ ...p, note: e.target.value }))}
            className="w-full bg-[#0d0d0d] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e87a]/50"
            placeholder="Optional note..."
          />
        </div>
        {/* Buttons */}
        <div className="col-span-2 flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#00e87a] text-black rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[#00fc85] transition disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {saving ? "Saving…" : "Save Changes"}
          </button>
          <button
            onClick={onCancel}
            className="flex items-center gap-2 px-5 py-2.5 bg-white/5 text-gray-300 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 transition border border-white/10"
          >
            <X className="w-3.5 h-3.5" /> Cancel
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function Logistics() {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterPartner, setFilterPartner] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [expandedId, setExpandedId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const fetchShipments = async () => {
    try {
      const { data } = await API.get("/orders/logistics");
      setShipments(data.shipments || []);
    } catch (err) {
      toast.error("Failed to load logistics data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShipments(); }, []);

  const handleSave = async (shipmentId, orderId, form) => {
    try {
      await API.put(`/orders/${orderId}/logistics`, form);
      toast.success("Shipment updated!");
      setEditingId(null);
      fetchShipments();
    } catch {
      toast.error("Failed to update shipment");
    }
  };

  // Filtered list
  const filtered = shipments.filter(s => {
    const order = s.order;
    const buyer = `${order?.user?.firstName || ""} ${order?.user?.lastName || ""}`.toLowerCase();
    const tracking = s.trackingCode?.toLowerCase() || "";
    const q = search.toLowerCase();
    const matchSearch = !q || buyer.includes(q) || tracking.includes(q);
    const matchPartner = filterPartner === "all" || s.partner === filterPartner;
    const matchStatus  = filterStatus  === "all" || s.status === filterStatus;
    return matchSearch && matchPartner && matchStatus;
  });

  if (loading) return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#00e87a] border-t-transparent rounded-full animate-spin shadow-[0_0_15px_rgba(0,232,122,0.5)]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0d0d] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Ambient glow */}
      <div className="fixed top-0 left-1/4 w-[50vw] h-[40vh] bg-[#00e87a]/4 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-10 lg:px-12">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <h1 className="text-4xl font-bold text-white tracking-tight mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
            Logistics Control
          </h1>
          <p className="text-gray-500 text-sm uppercase font-medium tracking-widest">
            {filtered.length} active shipments · real-time partner tracking
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Shipments", value: shipments.length, color: "#00e87a" },
            { label: "In Transit",      value: shipments.filter(s => s.status === "in_transit").length,       color: "#8b5cf6" },
            { label: "Delivered",       value: shipments.filter(s => s.status === "delivered").length,        color: "#00e87a" },
            { label: "Failed",          value: shipments.filter(s => s.status === "failed").length,           color: "#ef4444" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-[#111111] border border-white/5 rounded-2xl p-5"
            >
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">{stat.label}</p>
              <p className="text-3xl font-bold" style={{ color: stat.color }}>{stat.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search buyer or tracking code…"
              className="w-full bg-[#111111] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#00e87a]/40"
            />
          </div>
          {/* Partner filter */}
          <select
            value={filterPartner}
            onChange={e => setFilterPartner(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e87a]/40"
          >
            <option value="all">All Partners</option>
            <option value="eas_internal">eAson Internal</option>
            <option value="pathao">Pathao</option>
            <option value="daraz">Daraz</option>
          </select>
          {/* Status filter */}
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="bg-[#111111] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00e87a]/40"
          >
            <option value="all">All Statuses</option>
            {Object.entries(SHIPMENT_STATUSES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          {/* Refresh */}
          <button
            onClick={fetchShipments}
            className="flex items-center gap-2 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition"
          >
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Table */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl overflow-hidden">
          {/* Header row */}
          <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1.2fr_1fr_auto] gap-4 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
            {["Tracking / Order", "Buyer", "Partner", "Rider", "Status", ""].map((h, i) => (
              <span key={i} className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{h}</span>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="py-16 text-center text-gray-600 text-sm font-medium">
              No shipments found.{" "}
              {shipments.length === 0
                ? "Shipments are created automatically when an order is moved to Processing."
                : "Try adjusting your filters."}
            </div>
          ) : (
            <div className="divide-y divide-white/[0.04]">
              {filtered.map((shipment, i) => {
                const order = shipment.order;
                const buyer = order?.user
                  ? `${order.user.firstName || ""} ${order.user.lastName || ""}`.trim()
                  : "Unknown";
                const isExpanded = expandedId === shipment._id;
                const isEditing  = editingId  === shipment._id;

                return (
                  <motion.div
                    key={shipment._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-white/[0.02] transition-colors"
                  >
                    <div className="grid grid-cols-[2fr_1.5fr_1.2fr_1.2fr_1fr_auto] gap-4 px-6 py-4 items-center">
                      {/* Tracking + Order */}
                      <div>
                        <p className="text-xs font-mono font-bold text-[#00e87a]">{shipment.trackingCode}</p>
                        <p className="text-[10px] text-gray-500 mt-0.5">Order #{order?._id?.slice(-6).toUpperCase()}</p>
                        {order?.estimatedDelivery && (
                          <p className="text-[10px] text-gray-600 mt-0.5">
                            ETA: {new Date(shipment.estimatedDelivery || order.estimatedDelivery).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                          </p>
                        )}
                      </div>
                      {/* Buyer */}
                      <div>
                        <p className="text-sm font-bold text-white truncate">{buyer}</p>
                        <p className="text-[10px] text-gray-500 truncate">{order?.user?.email}</p>
                        {order?.shippingAddress && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <MapPin className="w-2.5 h-2.5 text-gray-600 shrink-0" />
                            <p className="text-[9px] text-gray-600 truncate max-w-[130px]">{order.shippingAddress}</p>
                          </div>
                        )}
                      </div>
                      {/* Partner */}
                      <div><PartnerBadge partner={shipment.partner} /></div>
                      {/* Rider */}
                      <div>
                        {shipment.riderName ? (
                          <>
                            <p className="text-xs font-bold text-gray-200">{shipment.riderName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              <Phone className="w-2.5 h-2.5 text-gray-500" />
                              <p className="text-[10px] text-gray-500">{shipment.riderPhone}</p>
                            </div>
                          </>
                        ) : (
                          <p className="text-[10px] text-gray-600">Not assigned</p>
                        )}
                      </div>
                      {/* Status */}
                      <div><StatusBadge status={shipment.status} /></div>
                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingId(isEditing ? null : shipment._id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-[#00e87a]/10 hover:text-[#00e87a] transition text-gray-400 border border-white/5"
                          title="Edit shipment"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : shipment._id)}
                          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-gray-400 border border-white/5"
                          title="View history"
                        >
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    {/* Expanded: Edit form + Timeline */}
                    <AnimatePresence>
                      {(isExpanded || isEditing) && (
                        <div className="px-6 pb-5">
                          {isEditing && (
                            <EditShipmentForm
                              shipment={shipment}
                              onSave={(form) => handleSave(shipment._id, order?._id, form)}
                              onCancel={() => setEditingId(null)}
                            />
                          )}
                          {isExpanded && !isEditing && (
                            <div className="mt-3">
                              <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest mb-2">Status History</p>
                              {shipment.statusHistory?.length > 0
                                ? <Timeline history={[...shipment.statusHistory].reverse()} />
                                : <p className="text-xs text-gray-600">No history recorded.</p>
                              }
                            </div>
                          )}
                        </div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
