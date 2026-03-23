import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  Tags
} from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Input styling for high-end feel
const BrandInput = ({ label, type = "text", ...props }) => (
  <div className="relative group">
    <input
      type={type}
      className="w-full bg-transparent border-b-2 border-gray-200 py-4 text-2xl md:text-4xl text-black placeholder-transparent focus:outline-none focus:border-black transition-colors peer"
      placeholder=" "
      {...props}
    />
    <label
      className="absolute left-0 -top-3.5 text-xs font-bold tracking-widest text-gray-400 uppercase transition-all 
        peer-placeholder-shown:text-xl peer-placeholder-shown:top-4 peer-placeholder-shown:text-gray-300 peer-placeholder-shown:font-medium 
        peer-focus:-top-3.5 peer-focus:text-xs peer-focus:font-bold peer-focus:text-black"
    >
      {label}
    </label>
  </div>
);

// Minimalist, high-end "Sneaker Drop" aesthetic
export default function AddProduct() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: Info, 2: Media, 3: Pricing, 4: Review
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
      } catch (err) {
        toast.error("Failed to load categories/units");
      }
    };
    fetchData();
  }, []);

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
    const [reorderedPrev] = prevPreviews.splice(result.source.index, 1);
    prevPreviews.splice(result.destination.index, 0, reorderedPrev);
    setPreviews(prevPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.category ||
      !form.unit ||
      !form.baseCost ||
      !form.wholesalerPrice
    ) {
      toast.error("Please fill all required fields.");
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("description", form.description);
      formData.append("baseCost", Number(form.baseCost));
      formData.append("wholesalerPrice", Number(form.wholesalerPrice));
      formData.append("stock", Number(form.stock || 1));
      formData.append("category", form.category);
      formData.append("unit", form.unit);
      form.images.forEach((image) => formData.append("images", image));

      await API.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Product Dropped Successfully. 🚀", {
        style: { background: "#000", color: "#fff", borderRadius: "12px" },
      });
      navigate("/marketplace");
    } catch (err) {
      toast.error(err.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white font-['Satoshi',sans-serif] selection:bg-black selection:text-white">
      {/* Top Nav */}
      <nav className="fixed top-0 w-full z-50 mix-blend-difference px-8 py-8 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="text-white flex items-center gap-2 font-medium tracking-wide hover:opacity-70 transition"
        >
          <ArrowLeft className="w-6 h-6" /> BACK
        </button>
        <div className="text-white font-bold tracking-widest text-sm uppercase">
          CREATE DROP
        </div>
      </nav>

      <div className="flex flex-col lg:flex-row min-h-screen">
        {/* LEFT PANEL: FORM */}
        <div className="w-full lg:w-1/2 pt-32 pb-24 px-8 md:px-16 lg:px-24 flex flex-col justify-center relative overflow-hidden">
          {/* Stepper Progress Bar */}
          <div className="absolute top-24 left-8 md:left-16 lg:left-24 w-48 h-1 bg-gray-100 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-black"
              initial={{ width: "0%" }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ ease: "anticipate", duration: 0.6 }}
            />
          </div>
          <div className="absolute top-28 left-8 md:left-16 lg:left-24 text-[10px] font-bold tracking-widest text-gray-400">
            STEP 0{step} / 04
          </div>

          <div className="max-w-xl w-full mt-10">
            <AnimatePresence mode="wait">
              {/* STEP 1: BASIC INFO */}
              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-12"
                >
                  <h1 className="text-6xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                    The <br /> Basics.
                  </h1>

                  <div className="space-y-10">
                    <BrandInput
                      label="Product Name"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />

                    <div className="relative">
                      <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Tell the narrative behind this drop..."
                        rows={4}
                        className="w-full bg-transparent border-2 border-gray-200 rounded-2xl p-6 text-lg text-black focus:outline-none focus:border-black transition-colors resize-none mt-2"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => { if(form.name) setStep(2); else toast.error("Name required") }}
                    className="w-full lg:w-auto px-12 py-5 bg-black text-white font-bold tracking-widest text-lg rounded-full hover:bg-gray-900 transition flex items-center justify-center gap-4"
                  >
                    NEXT <ArrowLeft className="w-6 h-6 rotate-180" />
                  </button>
                </motion.div>
              )}

              {/* STEP 2: MEDIA */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-10"
                >
                  <h1 className="text-6xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                    Visuals.
                  </h1>
                  <p className="text-xl text-gray-500 font-medium">
                    Upload ultra-high quality photos. Drag to reorder.
                  </p>

                  <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="media" direction="horizontal">
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          className="grid grid-cols-3 gap-4 min-h-[120px]"
                        >
                          {previews.map((src, index) => (
                            <Draggable key={`img-${index}`} draggableId={`img-${index}`} index={index}>
                              {(provided) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className="relative aspect-square rounded-2xl overflow-hidden group"
                                >
                                  <img src={src} alt="" className="w-full h-full object-cover" />
                                  <button
                                    onClick={() => removeImage(index)}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
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
                              className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-black hover:bg-gray-50 transition"
                            >
                              <Upload className="w-8 h-8 text-gray-400 mb-2" />
                              <span className="text-xs font-bold text-gray-400 tracking-widest uppercase">Add</span>
                            </div>
                          )}
                        </div>
                      )}
                    </Droppable>
                  </DragDropContext>
                  <input type="file" multiple accept="image/*" ref={fileInputRef} onChange={(e) => handleImageChange(e.target.files)} className="hidden" />

                  <div className="flex gap-4">
                    <button onClick={() => setStep(1)} className="px-8 py-5 border-2 border-black rounded-full font-bold uppercase tracking-widest hover:bg-gray-100 transition">
                      Back
                    </button>
                    <button
                      onClick={() => setStep(3)}
                      className="flex-1 py-5 bg-black text-white font-bold tracking-widest rounded-full hover:bg-gray-900 transition"
                    >
                      NEXT
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 3: PRICING & DATA */}
              {step === 3 && (
                <motion.div
                  key="step3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-12"
                >
                  <h1 className="text-6xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                    The <br /> Numbers.
                  </h1>

                  <div className="grid grid-cols-2 gap-x-8 gap-y-12">
                    <BrandInput label="Base Cost (RS)" type="number" name="baseCost" value={form.baseCost} onChange={handleChange} />
                    <BrandInput label="Sell Price (RS)" type="number" name="wholesalerPrice" value={form.wholesalerPrice} onChange={handleChange} />
                    <BrandInput label="Stock Qty" type="number" name="stock" value={form.stock} onChange={handleChange} />
                  </div>

                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Categorize</label>
                      <select name="category" value={form.category} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl font-bold focus:border-black outline-none">
                        <option value="">Select Category</option>
                        {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3">
                      <label className="text-xs font-bold tracking-widest text-gray-400 uppercase">Unit Type</label>
                      <select name="unit" value={form.unit} onChange={handleChange} className="w-full p-4 bg-gray-50 border-2 border-transparent rounded-xl font-bold focus:border-black outline-none">
                        <option value="">Select Unit</option>
                        {units.map((u) => <option key={u._id} value={u._id}>{u.name}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(2)} className="px-8 py-5 border-2 border-black rounded-full font-bold uppercase tracking-widest hover:bg-gray-100 transition">
                      Back
                    </button>
                    <button onClick={() => { if(form.category && form.unit && form.baseCost) setStep(4); else toast.error("Fill numbers clearly.")}}
                      className="flex-1 py-5 bg-black text-white font-bold tracking-widest rounded-full hover:bg-gray-900 transition"
                    >
                      REVIEW DROP
                    </button>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: REVIEW */}
              {step === 4 && (
                <motion.div
                  key="step4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-12"
                >
                  <h1 className="text-6xl sm:text-7xl font-black tracking-tighter uppercase leading-[0.9]">
                    Final <br /> Check.
                  </h1>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <span className="text-gray-500 font-medium uppercase tracking-widest text-sm">Price Point</span>
                      <span className="text-2xl font-bold">Rs {form.wholesalerPrice}</span>
                    </div>
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <span className="text-gray-500 font-medium uppercase tracking-widest text-sm">Initial Stock</span>
                      <span className="text-2xl font-bold bg-green-100 text-green-800 px-4 py-1 rounded-full">{form.stock} Units</span>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <button onClick={() => setStep(3)} className="px-8 py-5 border-2 border-black rounded-full font-bold uppercase tracking-widest hover:bg-gray-100 transition">
                      Back
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 py-5 bg-emerald-500 text-white font-bold tracking-widest rounded-full shadow-[0_0_40px_rgba(16,185,129,0.4)] hover:bg-emerald-400 hover:scale-[1.02] transition disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                      {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <CheckCircle2 className="w-6 h-6" />}
                      {loading ? "INITIALIZING..." : "CONFIRM DROP"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT PANEL: LIVE 3D/POSTER PREVIEW */}
        <div className="hidden lg:block lg:w-1/2 bg-black relative overflow-hidden">
          {/* Dynamic background lighting */}
          <div className="absolute inset-0 opacity-40">
             <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-emerald-600 rounded-full blur-[150px] mix-blend-screen animate-pulse" />
             <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-teal-800 rounded-full blur-[150px] mix-blend-screen" style={{ animationDuration: '4s' }} />
          </div>

          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1 }}
              className="relative w-[450px] h-[600px] bg-zinc-900/50 backdrop-blur-2xl rounded-3xl border border-white/10 p-8 shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Product Image Stage */}
              <div className="flex-1 bg-gradient-to-br from-zinc-800 to-black rounded-2xl relative overflow-hidden p-6 flex flex-col items-center justify-center">
                {previews.length > 0 ? (
                  <motion.img 
                    key={previews[0]}
                    src={previews[0]} 
                    alt="Preview" 
                    className="w-full h-full object-contain drop-shadow-2xl"
                    initial={{ filter: "blur(10px)", scale: 1.1 }}
                    animate={{ filter: "blur(0px)", scale: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <div className="flex flex-col items-center text-zinc-600">
                    <PackageSearch className="w-24 h-24 mb-4 opacity-50" />
                    <span className="font-bold tracking-widest uppercase text-sm">No Imagery</span>
                  </div>
                )}

                {/* Floating stock tag */}
                {form.stock > 0 && (
                   <div className="absolute top-4 right-4 bg-white/10 backdrop-blur text-white text-xs font-bold px-3 py-1.5 rounded-full">
                     {form.stock} IN STOCK
                   </div>
                )}
              </div>

              {/* Text Info Stage */}
              <div className="mt-8">
                <h3 className="text-3xl font-black tracking-tighter text-white uppercase">
                  {form.name || "UNTITLED DROP"}
                </h3>
                <div className="flex items-end justify-between mt-4">
                  <div className="space-y-1">
                    <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Wholesale Price</p>
                    <p className="text-4xl font-light text-emerald-400">Rs {form.wholesalerPrice || "---"}</p>
                  </div>
                  <div className="text-right opacity-50">
                     {form.category && <p className="text-white font-medium text-sm">CAT: {form.category.slice(0,4).toUpperCase()}</p>}
                     {form.unit && <p className="text-white font-medium text-sm">UNIT: {form.unit.slice(0,4).toUpperCase()}</p>}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}