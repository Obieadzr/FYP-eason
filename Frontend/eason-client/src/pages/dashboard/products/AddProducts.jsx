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
      data.append("image", imageFile);
    }

    try {
      setLoading(true);
      await API.post("/products", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
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
      <div className="bg-white rounded-3xl shadow-xl p-10">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black">Add New Product</h1>
          <button onClick={() => navigate("/dashboard/products")} className="p-3 hover:bg-gray-100 rounded-2xl">
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
                className="w-full px-6 py-5 text-xl bg-gray-50 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-purple-100 outline-none"
                required
              />

              <div className="grid grid-cols-2 gap-6">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="px-6 py-5 bg-gray-50 border border-gray-300 rounded-2xl"
                  required
                >
                  <option value="">Category *</option>
                  {categories.map((c) => (
                    <option key={c._id} value={c._id}>{c.name}</option>
                  ))}
                </select>

                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="px-6 py-5 bg-gray-50 border border-gray-300 rounded-2xl"
                  required
                >
                  <option value="">Unit *</option>
                  {units.map((u) => (
                    <option key={u._id} value={u._id}>{u.name}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <input
                  type="number"
                  placeholder="Base Cost (your cost) *"
                  value={formData.baseCost}
                  onChange={(e) => setFormData({ ...formData, baseCost: e.target.value })}
                  className="px-6 py-5 bg-gray-50 border border-gray-300 rounded-2xl"
                  required
                  min="0"
                  step="0.01"
                />

                <input
                  type="number"
                  placeholder="Wholesaler Price (selling to retailers) *"
                  value={formData.wholesalerPrice}
                  onChange={(e) => setFormData({ ...formData, wholesalerPrice: e.target.value })}
                  className="px-6 py-5 bg-gray-50 border border-gray-300 rounded-2xl"
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
                  className="px-6 py-5 bg-gray-50 border border-gray-300 rounded-2xl"
                />
              </div>

              <textarea
                placeholder="Description (optional)"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-6 py-5 bg-gray-50 border border-gray-300 rounded-2xl resize-none"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-4">Product Image</label>
              {imagePreview ? (
                <div className="relative">
                  <img src={imagePreview} alt="Preview" className="w-full h-96 object-cover rounded-3xl shadow-xl" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview("");
                      setImageFile(null);
                    }}
                    className="absolute top-4 right-4 p-3 bg-black/70 text-white rounded-full hover:bg-black"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="h-96 border-4 border-dashed border-gray-300 rounded-3xl flex flex-col items-center justify-center gap-4 hover:border-purple-500 transition">
                    <Package className="w-16 h-16 text-gray-400" />
                    <p className="text-xl font-medium text-gray-600">Click to upload image</p>
                    <p className="text-sm text-gray-500">PNG, JPG, WebP up to 50MB</p>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImage} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-6 pt-8 border-t">
            <button
              type="button"
              onClick={() => navigate("/dashboard/products")}
              className="flex-1 py-5 border border-gray-300 rounded-2xl font-bold hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-5 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-2xl hover:shadow-2xl disabled:opacity-70 transition"
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