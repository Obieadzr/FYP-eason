// src/pages/dashboard/Categories.jsx
import React, { useState, useEffect } from "react";
import API from "../../utils/api.js";
import { Plus, Search, Edit2, Trash2, Tag } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";
import { motion } from "framer-motion";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({ name: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await API.get("/categories");
        setCategories(res.data || []);
      } catch {
        toast.error("Failed to load categories");
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  const filtered = categories.filter(cat =>
    cat.name.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (cat = null) => {
    setEditingCategory(cat);
    setFormData({ name: cat?.name || "" });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return toast.error("Name is required");

    setSaving(true);
    try {
      if (editingCategory) {
        await API.put(`/categories/${editingCategory._id}`, { name: formData.name });
        toast.success("Category updated");
      } else {
        await API.post("/categories", { name: formData.name });
        toast.success("Category created");
      }
      setCategories(prev => 
        editingCategory
          ? prev.map(c => c._id === editingCategory._id ? { ...c, name: formData.name } : c)
          : [...prev, { _id: Date.now(), name: formData.name }]
      );
      setIsModalOpen(false);
    } catch {
      toast.error("Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this category?")) return;
    try {
      await API.delete(`/categories/${id}`);
      toast.success("Category deleted");
      setCategories(prev => prev.filter(c => c._id !== id));
    } catch {
      toast.error("Cannot delete – category in use");
    }
  };

  return (
    <>
      <Toaster position="top-right" />

      <div className="h-full flex flex-col">

        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-black tracking-tight text-gray-900">Categories</h1>
              <p className="text-gray-500 mt-2 font-medium">{categories.length} total categories</p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center gap-3 px-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-gray-800 transition"
            >
              <Plus className="w-5 h-5" />
              New Category
            </button>
          </div>

          {/* Search */}
          <div className="mt-8 max-w-xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-black/10 transition text-gray-900 font-medium placeholder:text-gray-400"
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 px-8 py-10 bg-gray-50">
          {loading ? (
            <TableSkeleton />
          ) : filtered.length === 0 ? (
            <EmptyState onCreate={() => openModal()} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50/50">
                    <th className="text-left px-8 py-5 font-semibold text-gray-900">Category</th>
                    <th className="text-left px-8 py-5 font-semibold text-gray-900">Slug</th>
                    <th className="text-left px-8 py-5 font-semibold text-gray-900">Products</th>
                    <th className="text-right px-8 py-5 font-semibold text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((cat, i) => (
                    <motion.tr
                      key={cat._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-gray-100 hover:bg-gray-50/50 transition"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center text-white">
                            <Tag className="w-6 h-6" />
                          </div>
                          <span className="font-bold text-gray-900 text-lg capitalize">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <code className="text-sm font-mono bg-gray-100 px-3 py-1.5 rounded-lg text-gray-700">
                          {cat.slug || "—"}
                        </code>
                      </td>
                      <td className="px-8 py-6">
                        <span className="font-medium text-gray-700">
                          {cat.productCount || 0} product{cat.productCount !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openModal(cat)}
                            className="p-3 hover:bg-gray-100 rounded-xl transition"
                          >
                            <Edit2 className="w-5 h-5 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDelete(cat._id)}
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

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
          >
            <h2 className="text-2xl font-black text-gray-900 mb-8">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">Category Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ name: e.target.value })}
                  placeholder="e.g. Electronics, Clothing"
                  className="w-full px-6 py-4 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-black/10 text-lg font-medium"
                  autoFocus
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-4 border border-gray-300 font-semibold rounded-xl hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !formData.name.trim()}
                  className="flex-1 py-4 bg-black text-white font-bold rounded-xl hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>Saving...</>
                  ) : (
                    <>{editingCategory ? "Update" : "Create"} Category</>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
};

const TableSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-200">
    {[...Array(5)].map((_, i) => (
      <div key={i} className="px-8 py-6 border-b border-gray-100 animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
          <div className="h-6 bg-gray-200 rounded-lg w-48"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ onCreate }) => (
  <div className="text-center py-32">
    <div className="w-28 h-28 mx-auto bg-gray-100 rounded-3xl flex items-center justify-center mb-8">
      <Tag className="w-14 h-14 text-gray-400" />
    </div>
    <h3 className="text-3xl font-black text-gray-900">No categories yet</h3>
    <p className="text-gray-500 mt-4 text-lg">Create your first category to organize products</p>
    <button
      onClick={onCreate}
      className="mt-8 px-8 py-4 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition"
    >
      + New Category
    </button>
  </div>
);

export default Categories;