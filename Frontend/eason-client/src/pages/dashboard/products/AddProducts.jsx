// src/pages/dashboard/products/AddProduct.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../../../utils/api";
import toast, { Toaster } from "react-hot-toast";
import { X, Package } from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "",
    unit: "",
    baseCost: "",
    wholesalerPrice: "",
    stock: "",
    description: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, unitRes] = await Promise.all([
          API.get("/categories"),
          API.get("/units"),
        ]);
        setCategories(catRes.data || []);
        setUnits(unitRes.data || []);
      } catch (err) {
        toast.error("Failed to load categories/units");
      }
    };
    fetchData();
  }, []);

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.wholesalerPrice) < Number(formData.baseCost)) {
      return toast.error("Wholesaler price cannot be less than base cost");
    }

    const data = new FormData();
    data.append("name", formData.name);
    data.append("category", formData.category);
    data.append("unit", formData.unit);
    data.append("baseCost", formData.baseCost);
    data.append("wholesalerPrice", formData.wholesalerPrice);
    data.append("stock", formData.stock || 0);
    data.append("description", formData.description || "");

    if (imageFile) {
      data.append("images", imageFile);
    }

    try {
      setLoading(true);
      await API.post("/products", data);
      toast.success("Product added successfully!");
      navigate("/dashboard/products");
    } catch (err) {
      console.log(err.response?.data);
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Toaster />
      <div className="bg-[#111] border border-[#222] rounded-3xl shadow-2xl p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-white" style={{ fontFamily: "'Syne', sans-serif" }}>Add New Product</h1>
          <button onClick={() => navigate("/dashboard/products")} className="p-3 hover:bg-white/5 text-gray-400 hover:text-white transition rounded-2xl">
            <X className="w-7 h-7" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid lg:grid-cols-2 gap-10">
            <div className="space-y-6">
              <input
                type="text"
                placeholder="Product Name *"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-6 py-5 text-xl bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-[#00e87a] outline-none"
                required
              />

              <div className="grid grid-cols-2 gap-6">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-6 py-5 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-[#00e87a] outline-none appearance-none"
                  required
                >
                  <option value="" disabled className="bg-[#111] text-gray-500">Category *</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id} className="bg-[#111] text-white">{c.name}</option>
                  ))}
                </select>

                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="px-6 py-5 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-[#00e87a] outline-none appearance-none"
                  required
                >
                  <option value="" disabled className="bg-[#111] text-gray-500">Unit *</option>
                  {units.map((u) => (
                    <option key={u._id} value={u._id} className="bg-[#111] text-white">{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  type="number"
                  placeholder="Base Cost (your cost) *"
                  value={formData.baseCost}
                  onChange={(e) => setFormData({ ...formData, baseCost: e.target.value })}
                  className="px-6 py-5 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-[#00e87a] outline-none"
                  required
                  min="0"
                  step="0.01"
                />

                <input
                  type="number"
                  placeholder="Wholesaler Price"
                  value={formData.wholesalerPrice}
                  onChange={(e) => setFormData({ ...formData, wholesalerPrice: e.target.value })}
                  className="px-6 py-5 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-[#00e87a] outline-none"
                  required
                  min="0"
                  step="0.01"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  type="number"
                  placeholder="Stock"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                  className="px-6 py-5 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-[#00e87a] outline-none"
                />
              </div>

              <textarea
                placeholder="Description (optional)"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-5 bg-white/5 border border-white/10 text-white placeholder-white/30 rounded-2xl focus:ring-2 focus:ring-[#00e87a] outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm tracking-wide uppercase font-semibold mb-4 text-gray-400">Product Image</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-96 object-cover rounded-3xl border border-white/10 shadow-2xl" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setImageFile(null);
                    }}
                    className="absolute top-4 right-4 p-3 bg-black/60 backdrop-blur text-white rounded-full hover:bg-black transition"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="h-96 border-2 border-dashed border-white/20 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-[#00e87a]/50 hover:bg-[#00e87a]/5 transition">
                    <Package className="w-16 h-16 text-gray-500" />
                    <p className="text-xl font-medium text-gray-300">Click to upload image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, WebP up to 50MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-6 pt-8 border-t border-white/10">
            <button
              type="button"
              onClick={() => navigate("/dashboard/products")}
              className="flex-1 py-5 border border-white/10 text-gray-300 rounded-xl font-bold hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-5 bg-[#00e87a] text-black font-extrabold tracking-wide uppercase rounded-xl hover:bg-[#00c766] hover:shadow-[0_0_20px_rgba(0,232,122,0.3)] disabled:opacity-70 transition"
            >
              {loading ? "Saving..." : "Add Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;