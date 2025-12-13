// src/pages/dashboard/Products.jsx
import React, { useState, useEffect } from "react";
import API from "../../utils/api.js";
import { Plus, Search, Edit2, Trash2, Package, AlertCircle, MoreVertical } from "lucide-react";
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

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category?.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatNPR = (amount) => `Rs. ${amount.toLocaleString("en-IN")}`;

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await API.delete(`/products/${id}`);
      toast.success("Product deleted");
      setProducts(prev => prev.filter(p => p._id !== id));
    } catch {
      toast.error("Delete failed");
    }
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="min-h-screen bg-gray-50">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900">Products</h1>
              <p className="text-gray-500 mt-2 font-medium">{products.length} items in inventory</p>
            </div>

            <button
              onClick={() => navigate("/dashboard/products/add")}
              className="flex items-center gap-3 px-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              <Plus className="w-5 h-5" />
              Add Product
            </button>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 transition text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="px-8 py-10">
          {loading ? (
            <TableSkeleton />
          ) : filteredProducts.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left px-8 py-5 font-semibold text-gray-900">Product</th>
                    <th className="text-left px-8 py-5 font-semibold text-gray-900">Category</th>
                    <th className="text-left px-8 py-5 font-semibold text-gray-900">Price</th>
                    <th className="text-left px-8 py-5 font-semibold text-gray-900">Stock</th>
                    <th className="text-right px-8 py-5 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((p, i) => (
                    <motion.tr
                      key={p._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition"
                    >
                      {/* Product Name + Image */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-5">
                          <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                            {p.image ? (
                              <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-cover" />
                            ) : (
                              <Package className="w-8 h-8 text-gray-400" />
                            )}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">{p.name}</h3>
                            <p className="text-sm text-gray-500">{p.sku || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="px-8 py-6">
                        <span className="text-gray-700 font-medium">{p.category?.name || "—"}</span>
                      </td>

                      {/* Price */}
                      <td className="px-8 py-6">
                        <span className="text-xl font-black text-gray-900">{formatNPR(p.price)}</span>
                      </td>

                      {/* Stock */}
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <span className={`font-bold ${p.stock < 10 ? "text-red-600" : "text-gray-900"}`}>
                            {p.stock}
                          </span>
                          {p.stock === 0 && (
                            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">Out of stock</span>
                          )}
                          {p.stock > 0 && p.stock < 10 && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full flex items-center gap-1">
                              <AlertCircle className="w-3 h-3" />
                              Low stock
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => navigate(`/dashboard/products/edit/${p._id}`)}
                            className="p-3 hover:bg-gray-100 rounded-xl transition"
                          >
                            <Edit2 className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(p._id)}
                            className="p-3 hover:bg-red-50 rounded-xl transition"
                          >
                            <Trash2 className="w-5 h-5 text-red-600" />
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

// Skeleton
const TableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
    {[...Array(6)].map((_, i) => (
      <div key={i} className="px-8 py-6 border-b border-gray-100 animate-pulse">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 bg-gray-200 rounded-xl"></div>
          <div className="space-y-3 flex-1">
            <div className="h-6 bg-gray-200 rounded-lg w-64"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    ))}
  </div>
);

// Empty State
const EmptyState = () => (
  <div className="text-center py-32">
    <div className="w-32 h-32 mx-auto bg-gray-100 rounded-3xl flex items-center justify-center mb-8">
      <Package className="w-16 h-16 text-gray-400" />
    </div>
    <h3 className="text-3xl font-black text-gray-900">No products found</h3>
    <p className="text-gray-500 mt-4 text-lg">Start by adding your first product</p>
  </div>
);

export default Products;