import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../utils/api";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  CheckCircle2,
  PackageSearch,
  Image as ImageIcon,
  Ruler,
  Tags,
  DollarSign,
  Package
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Navbar from "../../components/layout/Navbar";
import CategoryPicker from "../../components/products/CategoryPicker";
import ProductAttributesForm from "../../components/products/ProductAttributesForm";

const BrandInput = ({ label, type = "text", ...props }) => (
  <div className="space-y-2">
    <label className="text-sm font-semibold text-gray-700 tracking-wide">{label}</label>
    <input
      type={type}
      className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
      {...props}
    />
  </div>
);

export default function AddProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const editId = queryParams.get("edit");
  
  const [step, setStep] = useState(1);
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
  const [categories, setCategories] = useState([]);
  const [units, setUnits] = useState([]);
  const [attributeValues, setAttributeValues] = useState({});
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
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
        
        if (editId) {
          const prodRes = await API.get(`/products/${editId}`);
          const p = prodRes.data;
          setForm({
            name: p.name || "",
            description: p.description || "",
            baseCost: p.baseCost || "",
            wholesalerPrice: p.wholesalerPrice || p.price || "",
            stock: p.stock || "",
            category: p.category?._id || "",
            unit: p.unit?._id || "",
            images: [],
          });
          if (p.attributes) {
            setAttributeValues(p.attributes);
          }
          if (p.images && p.images.length > 0) {
            setPreviews(p.images.map(img => `http://localhost:5000${img}`));
          } else if (p.image) {
            setPreviews([`http://localhost:5000${p.image}`]);
          }
        }
      } catch (err) {
        toast.error("Failed to load initial data");
      }
    };
    fetchData();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (files) => {
    if (!files?.length) return;
    const newFiles = Array.from(files);
    const newPreviews = newFiles.map((file) => URL.createObjectURL(file));
    setForm((prev) => ({ ...prev, images: [...prev.images, ...newFiles] }));
    setPreviews((prev) => [...prev, ...newPreviews]);
  };

  const removeImage = (index) => {
    setForm((prev) => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    setPreviews((prev) => {
      if (prev[index].startsWith("blob:")) {
        URL.revokeObjectURL(prev[index]);
      }
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
    const [reorderedPrev] = prevPreviews.splice(result.source.index, 1);
    prevPreviews.splice(result.destination.index, 0, reorderedPrev);
    setPreviews(prevPreviews);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!form.name || !form.category || !form.unit || !form.baseCost || !form.wholesalerPrice) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("baseCost", Number(form.baseCost));
    formData.append("wholesalerPrice", Number(form.wholesalerPrice));
    formData.append("stock", Number(form.stock || 1));
    formData.append("category", form.category);
    formData.append("unit", form.unit);
    
    // Append dynamically collected attributes as a stringified JSON object
    if (Object.keys(attributeValues).length > 0) {
      formData.append("attributes", JSON.stringify(attributeValues));
    }

    form.images.forEach((image) => {
      if (image instanceof File) {
        formData.append("images", image);
      }
    });

    // Use native fetch() to bypass ALL Axios interceptors — the most reliable method for file uploads
    const token = localStorage.getItem("eason_token");
    const BASE = "http://localhost:5000/api";
    const url = editId ? `${BASE}/products/${editId}` : `${BASE}/products`;
    const method = editId ? "PUT" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        // DO NOT set Content-Type — browser sets it with the correct multipart boundary
        body: formData,
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.message || `Server error ${res.status}`);
      }

      toast.success(editId ? "Product Updated!" : "Product Dropped!");
      navigate("/profile");
    } catch (err) {
      console.error("Upload Error:", err);
      toast.error(err.message || "Upload failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const selectedCategory = categories.find(c => c._id === form.category);
  const selectedUnit = units.find(u => u._id === form.unit);

  const handleUnitSuggest = (unitName) => {
    // Find the unit ID by name
    const matches = units.filter(u => u.name.toLowerCase() === unitName.toLowerCase());
    if (matches.length > 0) {
      setForm(prev => ({ ...prev, unit: matches[0]._id }));
      toast.success(`Auto-selected ${unitName} based on category hint.`);
    } else {
      toast.error(`Unit "${unitName}" not found in database.`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50/20 font-['Satoshi',sans-serif]">
      <Navbar />

      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 sm:px-12 py-4 flex items-center justify-between shadow-sm">
        <button
          onClick={() => navigate(-1)}
          className="text-gray-900 font-semibold flex items-center gap-2 hover:text-emerald-600 transition"
        >
          <ArrowLeft className="w-5 h-5" /> Back
        </button>
        <div className="font-bold tracking-widest text-sm uppercase text-black">
          {editId ? "Edit Product" : "Create Drop"}
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-16 pb-24 px-4 sm:px-6 flex flex-col lg:flex-row gap-8">
        
        {/* LEFT PANEL: FORM WIZARD */}
        <div className="w-full lg:w-3/5">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 md:p-12 relative overflow-hidden">
            


            {/* Stepper */}
            <div className="flex items-center mb-12">
              {[1, 2, 3, 4].map((i) => (
                <React.Fragment key={i}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-colors ${
                    step >= i ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" : "bg-gray-100 text-gray-400"
                  }`}>
                    {i}
                  </div>
                  {i < 4 && (
                    <div className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                      step > i ? "bg-emerald-600" : "bg-gray-100"
                    }`} />
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="min-h-[400px]">
              <AnimatePresence mode="wait">
                
                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">The Basics</h1>
                      <p className="text-gray-500">Provide the fundamental details of your product.</p>
                    </div>

                    <div className="space-y-6">
                      <BrandInput
                        label="Product Name"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="e.g. Premium White Sneakers"
                      />

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 tracking-wide">Description</label>
                        <textarea
                          name="description"
                          value={form.description}
                          onChange={handleChange}
                          placeholder="Tell the narrative behind this drop..."
                          rows={4}
                          className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium resize-none"
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => { if(form.name) setStep(2); else toast.error("Product Name is required") }}
                      className="w-full py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm shadow-emerald-200 flex items-center justify-center gap-2"
                    >
                      Continue <ArrowLeft className="w-5 h-5 rotate-180" />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">Visuals</h1>
                      <p className="text-gray-500">Upload high quality photos showing your product.</p>
                    </div>

                    <DragDropContext onDragEnd={onDragEnd}>
                      <Droppable droppableId="media" direction="horizontal">
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                            className="grid grid-cols-3 gap-4 min-h-[140px]"
                          >
                            {previews.map((src, index) => (
                              <Draggable key={`img-${index}`} draggableId={`img-${index}`} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="relative aspect-square rounded-2xl overflow-hidden group border border-gray-300"
                                  >
                                    <img src={src} alt="" className="w-full h-full object-cover" />
                                    <button
                                      onClick={() => removeImage(index)}
                                      className="absolute inset-0 bg-gray-900/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <X className="text-white w-8 h-8" />
                                    </button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            
                            {previews.length < 5 && (
                              <div
                                onClick={() => fileInputRef.current?.click()}
                                className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 flex flex-col items-center justify-center cursor-pointer hover:border-emerald-400 hover:bg-emerald-50 transition"
                              >
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm font-semibold text-gray-500">Upload</span>
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={(e) => handleImageChange(e.target.files)} className="hidden" />

                    <div className="flex gap-4">
                      <button onClick={() => setStep(1)} className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">
                        Back
                      </button>
                      <button
                        onClick={() => setStep(3)}
                        className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm shadow-emerald-200"
                      >
                        Continue
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">The Numbers</h1>
                      <p className="text-gray-500">Set pricing, evaluate stock, and categorize.</p>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-6">
                      <BrandInput label="Base Cost (Rs)" type="number" name="baseCost" value={form.baseCost} onChange={handleChange} placeholder="0.00" />
                      <BrandInput label="Wholesale Price (Rs)" type="number" name="wholesalerPrice" value={form.wholesalerPrice} onChange={handleChange} placeholder="0.00" />
                      <BrandInput label="Initial Stock" type="number" name="stock" value={form.stock} onChange={handleChange} placeholder="1" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-gray-100">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 tracking-wide">Category <span className="text-red-500">*</span></label>
                        <CategoryPicker 
                          categories={categories}
                          value={form.category}
                          onChange={(id) => setForm(p => ({ ...p, category: id }))}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700 tracking-wide">Unit Type <span className="text-red-500">*</span></label>
                        <select name="unit" value={form.unit} onChange={handleChange} className="w-full bg-white border border-gray-300 text-gray-900 rounded-xl px-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium appearance-none">
                          <option value="">Select Unit</option>
                          {units.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                        </select>
                      </div>
                    </div>

                    {selectedCategory && (
                      <ProductAttributesForm
                        categorySlug={selectedCategory.slug}
                        initialValues={attributeValues}
                        onChange={setAttributeValues}
                        compact={false}
                        onUnitSuggest={handleUnitSuggest}
                      />
                    )}

                    <div className="flex gap-4 pt-4">
                      <button onClick={() => setStep(2)} className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">
                        Back
                      </button>
                      <button onClick={() => { if(form.category && form.unit && form.baseCost && form.wholesalerPrice) setStep(4); else toast.error("Pricing and Categories are required.")}}
                        className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm shadow-emerald-200"
                      >
                        Review
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 */}
                {step === 4 && (
                  <motion.div
                    key="step4"
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}
                    className="space-y-8"
                  >
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 mb-2">Final Check</h1>
                      <p className="text-gray-500">Confirm everything looks good before dropping.</p>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200 space-y-4">
                      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <span className="text-gray-500 font-semibold text-sm">Product Name</span>
                        <span className="font-bold text-gray-900">{form.name}</span>
                      </div>
                      <div className="flex items-center justify-between pb-4 border-b border-gray-200">
                        <span className="text-gray-500 font-semibold text-sm">Wholesale Price</span>
                        <span className="font-bold text-emerald-600">Rs {form.wholesalerPrice}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-500 font-semibold text-sm">Initial Stock</span>
                        <span className="font-bold bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs">{form.stock || 0} Units</span>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button onClick={() => setStep(3)} className="px-8 py-4 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition">
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex-1 py-4 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 transition shadow-sm shadow-emerald-200 disabled:opacity-50 flex items-center justify-center gap-3"
                      >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                        {loading ? "Processing..." : (editId ? "Save Changes" : "Confirm Drop")}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE PREVIEW */}
        <div className="w-full lg:w-2/5">
          <div className="sticky top-32">
            <h3 className="text-sm font-bold text-gray-400 tracking-widest uppercase mb-4 ml-2">Live Preview</h3>
            
            <div className="bg-white rounded-3xl border border-gray-100 shadow-lg overflow-hidden flex flex-col group transition-all duration-300 hover:shadow-xl">
              {/* Image Box */}
              <div className="aspect-[4/3] bg-gray-50 relative overflow-hidden flex items-center justify-center p-6">
                {previews.length > 0 ? (
                  <img 
                    src={previews[0]} 
                    alt="Preview" 
                    className="w-full h-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-300">
                    <ImageIcon className="w-16 h-16 mb-2" />
                    <span className="text-xs font-semibold uppercase tracking-widest">No Image</span>
                  </div>
                )}

                {/* Stock Badge */}
                {form.stock > 0 && (
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full shadow-sm border border-emerald-100">
                    {form.stock} IN STOCK
                  </div>
                )}
              </div>

              {/* Text Info Stage */}
              <div className="p-6 bg-white shrink-0">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-xl font-bold text-gray-900 leading-tight">
                    {form.name || "Untitled Product"}
                  </h3>
                </div>
                
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 min-h-[40px]">
                  {form.description || "Product description will appear here..."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Wholesale Price</span>
                    <span className="text-2xl font-bold text-gray-900">
                      Rs {form.wholesalerPrice || "---"}
                    </span>
                  </div>
                  
                  <div className="text-right flex flex-col items-end gap-1.5">
                     {selectedCategory && (
                       <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
                         <Tags className="w-3 h-3" /> {selectedCategory.name}
                       </div>
                     )}
                     {selectedUnit && (
                       <div className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md">
                         <Ruler className="w-3 h-3" /> {selectedUnit.name}
                       </div>
                     )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}