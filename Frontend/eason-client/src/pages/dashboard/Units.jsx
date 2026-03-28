import React, { useState, useEffect } from "react";
import API from "../../utils/api.js";
import { Plus, Search, Edit2, Trash2, Package, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const Units = () => {
  const [units, setUnits] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchUnits = async () => {
      try {
        const res = await API.get("/units");
        setUnits(res.data || []);
      } catch {
        toast.error("Failed to load units");
      } finally {
        setLoading(false);
      }
    };
    fetchUnits();
  }, []);

  const filtered = units.filter(unit =>
    unit.name.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (unit = null) => {
    setEditingUnit(unit);
    setFormData({ name: unit?.name || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Unit name is required");

    setSaving(true);
    try {
      if (editingUnit) {
        await API.put(`/units/${editingUnit._id}`, { name: formData.name });
        toast.success("Unit metric updated");
      } else {
        await API.post("/units", { name: formData.name });
        toast.success("Unit metric established");
      }
      setUnits(prev =>
        editingUnit
          ? prev.map(u => u._id === editingUnit._id ? { ...u, name: formData.name } : u)
          : [...prev, { _id: Date.now(), name: formData.name }]
      );
      setIsModalOpen(false);
    } catch {
      toast.error("Commit failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this measurement unit permanently?")) return;
    try {
      await API.delete(`/units/${id}`);
      toast.success("Unit metric dropped");
      setUnits(prev => prev.filter(u => u._id !== id));
    } catch {
      toast.error("Conflict – unit currently assigned to active products");
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ style: { background: '#111', color: '#fff', border: '1px solid #222' } }} />

      <div className="h-full flex flex-col bg-[#0d0d0d] text-white" style={{ fontFamily: "'DM Sans', sans-serif" }}>
        
        {/* Header Section */}
        <div className="bg-[#0d0d0d] border-b border-[#222] px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Measurement Units</h1>
              <p className="text-gray-500 font-medium tracking-wide text-sm">{units.length} defined metrics</p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-3 px-6 py-3.5 bg-[#00e87a] text-black rounded-full font-bold hover:bg-[#00fc85] transition-colors shadow-lg shadow-[#00e87a]/10"
            >
              <Plus className="w-5 h-5" />
              Define Metric
            </button>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Search metrics..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-[#111111] border border-[#222] rounded-2xl focus:outline-none focus:border-[#00e87a] focus:ring-1 focus:ring-[#00e87a] transition-colors text-white font-medium placeholder:text-gray-600 shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="flex-1 px-8 py-10 bg-[#0d0d0d]">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-[#00e87a] animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-[#111111] border border-[#222] rounded-3xl p-16 text-center max-w-2xl mx-auto mt-10">
              <div className="w-20 h-20 bg-[#0d0d0d] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#222]">
                <Package className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>No Metrics Found</h3>
              <p className="text-gray-500 mb-8">Establish measurement units (Kg, Boxes, Pallets) for wholesalers to use.</p>
              <button onClick={() => openModal()} className="px-8 py-3 bg-white text-black font-bold outline-none rounded-full hover:bg-gray-200 transition-colors">
                Define First Metric
              </button>
            </div>
          ) : (
            <div className="bg-[#111111] rounded-2xl border border-[#222] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0d0d0d] border-b border-[#222]">
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Unit Name</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Internal Symbol</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Settings</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {filtered.map((unit, i) => (
                      <motion.tr
                        key={unit._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[#1a1a1a] transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-[#0d0d0d] border border-[#222] rounded-xl flex items-center justify-center group-hover:border-[#00e87a]/30 transition-colors">
                              <Package className="w-4 h-4 text-[#00e87a]" />
                            </div>
                            <span className="font-bold text-white tracking-wide text-base">{unit.name}</span>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <code className="text-xs font-mono bg-[#0d0d0d] border border-[#222] px-3 py-1.5 rounded-lg text-[#00e87a]">
                            _{unit.shortForm || unit.name.substring(0, 3).toLowerCase()}
                          </code>
                        </td>
                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => openModal(unit)} className="p-2.5 hover:bg-[#222] rounded-lg transition-colors text-gray-400 hover:text-white">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(unit._id)} className="p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-gray-400">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Modal ── */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#111111] border border-[#222] rounded-3xl shadow-2xl max-w-md w-full overflow-hidden"
              style={{ fontFamily: "'DM Sans', sans-serif" }}
            >
              <div className="p-8 pb-0">
                <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>
                  {editingUnit ? "Edit Metric" : "New Metric"}
                </h2>
                <p className="text-gray-500 text-sm">Define a new measurement unit framework.</p>
              </div>
              
              <form onSubmit={handleSubmit} className="p-8 pt-6">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Unit Label</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ name: e.target.value })}
                      placeholder="e.g. Master Cartons"
                      className="w-full px-5 py-4 bg-[#0d0d0d] border border-[#222] rounded-xl focus:outline-none focus:border-[#00e87a] focus:ring-1 focus:ring-[#00e87a] text-white font-medium placeholder:text-gray-600 transition-colors"
                      autoFocus
                    />
                  </div>
                </div>
                
                <div className="flex gap-4 pt-10">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-4 bg-transparent border border-[#333] text-white font-bold rounded-xl hover:bg-[#1a1a1a] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving || !formData.name.trim()}
                    className="flex-1 py-4 bg-[#00e87a] text-black font-bold rounded-xl hover:bg-[#00fc85] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : editingUnit ? "Save Configuration" : "Commit Metric"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Units;