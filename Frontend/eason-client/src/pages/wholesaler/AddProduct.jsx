// src/pages/wholesaler/AddProduct.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../utils/api";
import {
  ArrowLeft,
  Save,
  Package,
  DollarSign,
  Boxes,
  Tags,
  Image as ImageIcon,
  Upload,
  X,
  Loader2,
  Eye,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function AddProduct() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Basic, 2: Pricing/Stock, 3: Media, 4: Review
  const [form, setForm] = useState({
    name: "",
    description: "",
    baseCost: "",
    wholesalerPrice: "",
    stock: "",
    category: "",
    unit: "",
    images: [],
  });
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState([]);
  const fileInputRef = useRef(null);

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

  const validateCurrentStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!form.name.trim()) newErrors.name = "Product name is required";
    } else if (step === 2) {
      if (!form.baseCost || Number(form.baseCost) <= 0) newErrors.baseCost = "Valid base cost required";
      if (!form.wholesalerPrice || Number(form.wholesalerPrice) <= 0) newErrors.wholesalerPrice = "Valid wholesaler price required";
      if (!form.stock || Number(form.stock) < 1) newErrors.stock = "Stock must be at least 1";
      if (!form.category) newErrors.category = "Category is required";
      if (!form.unit) newErrors.unit = "Unit is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (files) => {
    if (!files?.length) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));

    setForm((prev) => ({
      ...prev,
      images: [...prev.images, ...newFiles],
    }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(form.images);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setForm((prev) => ({ ...prev, images: items }));

    const prevPreviews = Array.from(previews);
    const [reorderedPreview] = prevPreviews.splice(result.source.index, 1);
    prevPreviews.splice(result.destination.index, 0, reorderedPreview);
    setPreviews(prevPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (step !== 4 || !validateCurrentStep()) return;

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("baseCost", Number(form.baseCost));
      formData.append("wholesalerPrice", Number(form.wholesalerPrice));
      formData.append("stock", Number(form.stock));
      formData.append("category", form.category);
      formData.append("unit", form.unit);

      form.images.forEach((image) => {
        formData.append("images", image);
      });

      const res = await API.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product added successfully!");
      navigate("/marketplace");
    } catch (err) {
      console.error("Submission error:", err);
      toast.error(err.response?.data?.message || "Failed to add product");
    } finally {
      setLoading(false);
    }
  };

  const inputBase = `
    peer w-full px-4 pt-6 pb-2 bg-white/80 backdrop-blur-sm border 
    rounded-xl shadow-sm focus:outline-none focus:border-emerald-500 
    focus:ring-2 focus:ring-emerald-500/30 transition-all duration-200
    text-gray-900 placeholder-transparent
  `;

  const labelBase = `
    absolute left-4 top-4 z-10 origin-[0] text-sm font-medium text-gray-500 
    transition-all duration-200 peer-focus:text-emerald-600 peer-focus:text-xs 
    peer-focus:-translate-y-3 peer-focus:scale-90 peer-placeholder-shown:scale-100 
    peer-placeholder-shown:translate-y-0 peer-placeholder-shown:text-base
  `;

  const errorInput = "border-red-500 focus:border-red-500 focus:ring-red-500/30";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 pb-20 lg:pb-0">
      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-white/90 backdrop-blur-lg border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/marketplace")}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-xl font-semibold text-gray-900">Add New Product</h1>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden sm:inline text-sm text-gray-600">
              Step {step} of 4
            </span>
            <button
              onClick={handleSubmit}
              disabled={loading || step < 4}
              className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-60 transition shadow-sm"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {loading ? "Publishing..." : "Publish"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        <div className="grid lg:grid-cols-3 gap-8 xl:gap-12">
          {/* Form Area */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.section
                    key="basic"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100/80 p-6 md:p-8"
                  >
                    {/* ... Basic Information content remains the same ... */}
                    <div className="flex items-center gap-3 mb-6">
                      <Package className="w-6 h-6 text-emerald-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Basic Information</h2>
                    </div>

                    <div className="space-y-6">
                      <div className="relative">
                        <input
                          id="name"
                          name="name"
                          value={form.name}
                          onChange={handleChange}
                          placeholder=" "
                          required
                          className={`${inputBase} ${errors.name ? errorInput : "border-gray-200"}`}
                        />
                        <label htmlFor="name" className={labelBase}>
                          Product Name *
                        </label>
                        {errors.name && <p className="mt-1.5 text-sm text-red-600">{errors.name}</p>}
                      </div>

                      <div className="relative">
                        <textarea
                          id="description"
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          rows={5}
                          placeholder=" "
                          className={`${inputBase} resize-y min-h-[120px] ${errors.description ? errorInput : "border-gray-200"}`}
                        />
                        <label htmlFor="description" className={labelBase}>
                          Description
                        </label>
                      </div>
                    </div>

                    <div className="mt-10 flex justify-end">
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-7 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
                      >
                        Next: Pricing <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.section>
                )}

                {/* Pricing step - remains unchanged */}
                {step === 2 && (
                  <motion.section
                    key="pricing"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100/80 p-6 md:p-8"
                  >
                    {/* ... Pricing & Stock content ... */}
                    {/* (keep your existing pricing fields code here) */}
                    <div className="mt-10 flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-7 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition flex items-center gap-2"
                      >
                        <ChevronLeft className="w-5 h-5" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-7 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
                      >
                        Next: Media <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.section>
                )}

                {/* Media step */}
                {step === 3 && (
                  <motion.section
                    key="media"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -30 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100/80 p-6 md:p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <ImageIcon className="w-6 h-6 text-emerald-600" />
                      <h2 className="text-2xl font-bold text-gray-900">Product Images</h2>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="images" direction="horizontal">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6 min-h-[140px]"
                          >
                            {previews.map((src, index) => (
                              <Draggable key={index} draggableId={`img-${index}`} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="relative group rounded-xl overflow-hidden shadow-sm border border-gray-200 bg-gray-50"
                                  >
                                    <img
                                      src={src}
                                      alt={`preview-${index}`}
                                      className="w-full h-36 object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeImage(index)}
                                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 shadow-lg opacity-0 group-hover:opacity-100 transition"
                                    >
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>

                    <div
                      className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition cursor-pointer"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => handleImageChange(e.target.files)}
                        className="hidden"
                      />
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-base font-medium text-gray-700">
                        Click to upload or drag & drop images
                      </p>
                      <p className="text-sm text-gray-500 mt-2">
                        PNG, JPG, GIF • Recommended max 5MB per image • Up to 8 images
                      </p>
                    </div>

                    <div className="mt-10 flex justify-between">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-7 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition flex items-center gap-2"
                      >
                        <ChevronLeft className="w-5 h-5" /> Back
                      </button>
                      <button
                        type="button"
                        onClick={nextStep}
                        className="px-7 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm"
                      >
                        Next: Review <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </motion.section>
                )}

                {/* Review step */}
                {step === 4 && (
                  <motion.section
                    key="review"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4 }}
                    className="bg-white rounded-2xl shadow-xl border border-gray-100/80 p-6 md:p-8"
                  >
                    {/* ... Review content remains the same ... */}
                    <div className="mt-10 flex justify-between pt-6 border-t border-gray-100">
                      <button
                        type="button"
                        onClick={prevStep}
                        className="px-7 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition flex items-center gap-2"
                      >
                        <ChevronLeft className="w-5 h-5" /> Back
                      </button>
                      <button
                        type="submit"
                        disabled={loading}
                        className="px-8 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition shadow-lg flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Publishing...
                          </>
                        ) : (
                          <>
                            <Save className="w-5 h-5" />
                            Publish to Marketplace
                          </>
                        )}
                      </button>
                    </div>
                  </motion.section>
                )}
              </AnimatePresence>
            </form>
          </div>

          {/* ── LIVE PREVIEW SIDEBAR ──────────────────────────────────────────────── */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24 bg-white rounded-2xl shadow-xl border border-gray-100/80 p-6">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-3">
                <Eye className="w-6 h-6 text-emerald-600" />
                Live Preview
              </h3>

              {/* Main product image preview */}
              <div className="aspect-[4/5] bg-gray-50 rounded-xl overflow-hidden border border-gray-200 mb-5 shadow-inner relative">
                {previews.length > 0 ? (
                  <img
                    src={previews[0]}
                    alt="Product main preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                    <Package className="w-16 h-16 mb-3" />
                    <p className="text-sm">Product image will appear here</p>
                  </div>
                )}
              </div>

              {/* Small gallery - shows ALL uploaded images */}
              {previews.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {previews.length} image{previews.length !== 1 ? "s" : ""} uploaded
                  </p>
                  <div className="grid grid-cols-4 gap-2">
                    {previews.map((src, idx) => (
                      <div
                        key={idx}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-200 bg-gray-50"
                      >
                        <img
                          src={src}
                          alt={`thumbnail-${idx}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Product info */}
              <h4 className="font-bold text-xl text-gray-900 truncate mb-2 mt-6">
                {form.name || "Product Name"}
              </h4>

              <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                {form.description || "A detailed description of your product will appear here..."}
              </p>

              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-2xl font-bold text-emerald-600">
                  Rs {form.wholesalerPrice || "—"}
                </span>
                <span className="text-sm text-gray-500">/ unit</span>
              </div>

              <div className="text-sm">
                <span className="font-medium">Stock:</span>{" "}
                <span className={form.stock > 0 ? "text-emerald-600" : "text-red-600"}>
                  {form.stock || "—"} available
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40 shadow-lg">
        <button
          onClick={handleSubmit}
          disabled={loading || step < 4}
          className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-md"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {loading ? "Publishing..." : "Publish Product"}
        </button>
      </div>
    </div>
  );
}