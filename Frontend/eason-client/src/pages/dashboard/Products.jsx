import React, { useState, useEffect } from "react";
import API from "../../utils/api.js";
import { Plus, Search, Edit2, Trash2, Package, AlertCircle, Loader2 } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const Products = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products");
        setProducts(res.data || []);
      } catch (err) {
        toast.error("Failed to load global inventory");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name?.toLowerCase().includes(search.toLowerCase())
  );

  const formatNPR = (amount) => {
    if (amount == null) return "—";
    return `Rs. ${Number(amount).toLocaleString("en-IN")}`;
  };

  const handleDelete = async (id) => {
    if (!window.confirm("CRITICAL: Erase this product permanently?")) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success("Product erased");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Constraint block – product exists in active orders");
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
              <h1 className="text-4xl font-bold tracking-tight text-white mb-2" style={{ fontFamily: "'Syne', sans-serif" }}>Product Matrix</h1>
              <p className="text-gray-500 font-medium tracking-wide text-sm">
                Showing {filteredProducts.length} out of {products.length} registered SKUs
              </p>
            </div>
            <button
              onClick={() => navigate("/dashboard/products/add")}
              className="flex items-center gap-3 px-6 py-3.5 bg-[#00e87a] text-black rounded-full font-bold hover:bg-[#00fc85] transition-colors shadow-lg shadow-[#00e87a]/10"
            >
              <Plus className="w-5 h-5" />
              Initialize SKU
            </button>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
              <input
                type="text"
                placeholder="Query by nomenclature or classification..."
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
          ) : filteredProducts.length === 0 ? (
            <div className="bg-[#111111] border border-[#222] rounded-3xl p-16 text-center max-w-2xl mx-auto mt-10">
              <div className="w-20 h-20 bg-[#0d0d0d] rounded-full flex items-center justify-center mx-auto mb-6 border border-[#222]">
                <Package className="w-8 h-8 text-gray-500" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: "'Syne', sans-serif" }}>
                {search ? "Zero Returns" : "Inventory Void"}
              </h3>
              <p className="text-gray-500 mb-8">
                {search ? `No parameters matched "${search}".` : "The master inventory ledger is currently empty."}
              </p>
              {!search && (
                <button onClick={() => navigate("/dashboard/products/add")} className="px-8 py-3 bg-white text-black font-bold outline-none rounded-full hover:bg-gray-200 transition-colors">
                  Populate Ledger
                </button>
              )}
            </div>
          ) : (
            <div className="bg-[#111111] rounded-2xl border border-[#222] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#0d0d0d] border-b border-[#222]">
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Asset Identifier</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Category</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Wholesale Tx</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">MSRP</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Reserve</th>
                      <th className="py-5 px-8 text-xs font-bold text-gray-500 uppercase tracking-widest text-right">Overrides</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#222]">
                    {filteredProducts.map((p, i) => (
                      <motion.tr
                        key={p._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="hover:bg-[#1a1a1a] transition-colors group"
                      >
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-5">
                            <div className="w-14 h-14 bg-[#0d0d0d] border border-[#222] rounded-xl flex items-center justify-center overflow-hidden flex-shrink-0 group-hover:border-[#00e87a]/30 transition-colors">
                              {p.image ? (
                                <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                              ) : (
                                <Package className="w-5 h-5 text-gray-600" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-bold text-base text-white tracking-wide">{p.name}</h3>
                              <p className="text-xs text-gray-500 font-mono mt-1">ID: #{p._id.slice(-6).toUpperCase()}</p>
                            </div>
                          </div>
                        </td>

                        <td className="px-8 py-6">
                           <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold tracking-widest uppercase bg-[#0d0d0d] text-gray-400 border border-[#222]">
                             {p.category?.name || "UNCLASSIFIED"}
                           </span>
                        </td>

                        <td className="px-8 py-6 font-mono text-sm tracking-wider text-gray-300">
                          {formatNPR(p.wholesalerPrice)}
                        </td>

                        <td className="px-8 py-6 font-mono text-sm tracking-wider font-bold text-[#00e87a]">
                          {formatNPR(p.suggestedRetailPrice)}
                        </td>

                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <span className={`font-mono text-base font-bold tracking-widest ${p.stock < 10 ? "text-red-500" : "text-white"}`}>
                              {p.stock}
                            </span>
                            {p.stock === 0 && (
                              <span className="px-2 py-1 bg-red-500/10 border border-red-500/20 text-red-500 text-[10px] uppercase tracking-widest font-bold rounded-lg border-red-500">
                                DEPLETED
                              </span>
                            )}
                            {p.stock > 0 && p.stock < 10 && (
                              <span className="px-2 py-1 bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] uppercase tracking-widest font-bold rounded-lg flex items-center gap-1">
                                <AlertCircle size={10} /> CRITICAL
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-8 py-6 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button onClick={() => navigate(`/dashboard/products/edit/${p._id}`)} className="p-2.5 hover:bg-[#222] rounded-lg transition-colors text-gray-400 hover:text-white">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(p._id)} className="p-2.5 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-colors text-gray-400">
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
    </>
  );
};

export default Products;