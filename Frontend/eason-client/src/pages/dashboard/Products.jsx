import React, { useState, useEffect } from "react";
import API from "../../utils/api.js";
import { Plus, Search, Edit2, Trash2, Package, AlertCircle } from "lucide-react";
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
        toast.error("Failed to load products");
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
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success("Product deleted");
      setProducts((prev) => prev.filter((p) => p._id !== id));
    } catch {
      toast.error("Delete failed – product may be in orders");
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-10">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900">Products</h1>
              <p className="text-gray-500 mt-2 font-medium">
                {filteredProducts.length} / {products.length} items shown
              </p>
            </div>

            <button
              onClick={() => navigate("/dashboard/products/add")}
              className="flex items-center gap-3 px-8 py-4 bg-black text-white rounded-xl font-semibold hover:bg-gray-900 transition shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add New Product
            </button>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-500" />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-5 bg-gray-100 border border-gray-200 rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100 transition text-lg font-medium placeholder-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-12">
          {loading ? (
            <TableSkeleton />
          ) : filteredProducts.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/80">
                    <th className="text-left px-8 py-6 font-semibold text-gray-900">Product</th>
                    <th className="text-left px-8 py-6 font-semibold text-gray-900">Category</th>
                    <th className="text-left px-8 py-6 font-semibold text-gray-900">Wholesale Price</th>
                    <th className="text-left px-8 py-6 font-semibold text-gray-900">Suggested Retail</th>
                    <th className="text-left px-8 py-6 font-semibold text-gray-900">Stock</th>
                    <th className="text-right px-8 py-6 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="border-b border-gray-100 hover:bg-emerald-50/30 transition"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center overflow-hidden border border-gray-200 flex-shrink-0">
                            {p.image ? (
                              <img
                                src={`http://localhost:5000${p.image}`}
                                alt={p.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-lg text-gray-900">{p.name}</h3>
                            <p className="text-sm text-gray-500">{p.description?.slice(0, 60) || "No description"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="px-8 py-6 font-medium text-gray-700">{p.category?.name || "—"}</td>

                      <td className="px-8 py-6">
                        <span className="text-xl font-bold text-gray-900">
                          {formatNPR(p.wholesalerPrice)}
                        </span>
                      </td>

                      <td className="px-8 py-6">
                        <span className="text-xl font-bold text-emerald-700">
                          {formatNPR(p.suggestedRetailPrice)}
                        </span>
                      </td>

                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold text-lg ${p.stock < 10 ? "text-red-600" : "text-gray-900"}`}>
                            {p.stock}
                          </span>
                          {p.stock === 0 && (
                            <span className="px-4 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
                              Out of stock
                            </span>
                          )}
                          {p.stock > 0 && p.stock < 10 && (
                            <span className="px-4 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1.5">
                              <AlertCircle size={14} /> Low stock
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <button
                            onClick={() => navigate(`/dashboard/products/edit/${p._id}`)}
                            className="p-3 hover:bg-gray-100 rounded-xl transition"
                          >
                            <Edit2 className="w-6 h-6 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-3 hover:bg-red-50 rounded-xl transition"
                          >
                            <Trash2 className="w-6 h-6 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

const TableSkeleton = () => (
  <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="px-8 py-8 border-b border-gray-100 animate-pulse">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl"></div>
          <div className="flex-1 space-y-4">
            <div className="h-7 bg-gray-200 rounded w-3/4"></div>
            <div className="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ search }) => (
  <div className="text-center py-32 bg-white rounded-3xl border border-gray-200 shadow-sm">
    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-8">
      <Package className="w-16 h-16 text-gray-400" />
    </div>
    <h3 className="text-3xl font-black text-gray-900 mb-4">
      {search ? "No matching products" : "No products yet"}
    </h3>
    <p className="text-gray-600 text-lg mb-8 max-w-md mx-auto">
      {search
        ? `No results found for "${search}". Try different keywords.`
        : "Start by adding your first product to the inventory."}
    </p>
    {!search && (
      <button
        onClick={() => navigate("/dashboard/products/add")}
        className="px-10 py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition shadow-lg"
      >
        + Add New Product
      </button>
    )}
  </div>
);

export default Products;