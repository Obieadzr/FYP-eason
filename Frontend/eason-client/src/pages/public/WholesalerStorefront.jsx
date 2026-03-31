// src/pages/public/WholesalerStorefront.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Package, CheckCircle2, MessageCircle, MapPin, 
  ArrowLeft, Store, ShieldCheck, Mail
} from "lucide-react";
import API from "../../utils/api";
import { useAuthStore } from "../../store/authStore";
import { useCart } from "../../context/CartContext";
import { useChat } from "../../store/useChat";
import Navbar from "../../components/layout/Navbar";
import toast from "react-hot-toast";

const FONT_STYLE = { fontFamily: "'Inter', sans-serif" };

export default function WholesalerStorefront() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { startChat } = useChat();
  const { addToCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [supplier, setSupplier] = useState(null);

  useEffect(() => {
    const fetchSupplierData = async () => {
      try {
        const res = await API.get("/products");
        const allProducts = res.data || [];
        const supplierProducts = allProducts.filter(p => p.wholesaler?._id === id);
        
        if (supplierProducts.length > 0) {
          setSupplier(supplierProducts[0].wholesaler);
          setProducts(supplierProducts);
        } else {
          // Fallback if supplier has no products
          toast.error("Supplier not found or has no active products.");
          navigate("/marketplace");
        }
      } catch (err) {
        toast.error("Failed to load storefront.");
      } finally {
        setLoading(false);
      }
    };
    fetchSupplierData();
  }, [id, navigate]);

  const getDisplayPrice = (product) => {
    const info = product.priceInfo || {};
    const legacy = product.price || product.wholesalerPrice || 0;
    if (!user) return info.finalPrice || legacy;
    if (user.role === "retailer") return info.purchasePrice || legacy;
    if (user.role === "wholesaler") return info.sellingPrice || legacy;
    return info.finalPrice || legacy;
  };

  const handleChat = () => {
    if (!user) {
      toast.error("Please login to chat with suppliers");
      navigate("/login");
      return;
    }
    if (user._id === id) {
      toast.error("You cannot chat with yourself");
      return;
    }
    startChat({ wholesalerId: id });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center">
        <Store className="w-12 h-12 text-gray-300 animate-pulse mb-4" />
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-widest">Loading Storefront</p>
      </div>
    );
  }

  if (!supplier) return null;

  const supplierName = supplier.companyName || `${supplier.firstName} ${supplier.lastName}`.trim() || "Wholesale Partner";
  const initial = supplierName.charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#f9f9f9]" style={FONT_STYLE}>
      <Navbar />

      {/* STOREFRONT BANNER */}
      <div className="bg-[#111] pt-32 pb-16 px-6 relative overflow-hidden">
        {/* Abstract Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute w-[500px] h-[500px] bg-emerald-500 rounded-full blur-[100px] -top-32 -right-32"></div>
        </div>

        <div className="max-w-screen-xl mx-auto relative z-10 flex flex-col md:flex-row items-center md:items-end gap-6 md:gap-10">
          {/* Logo */}
          <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-gray-800 to-black rounded-3xl border-4 border-[#111] shadow-2xl flex items-center justify-center -mb-8 md:-mb-24 z-20 shrink-0 transform-gpu overflow-hidden">
             <span className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-teal-200">
               {initial}
             </span>
          </div>

          <div className="text-center md:text-left flex-1">
            <div className="flex flex-col md:flex-row md:items-center gap-3 mb-2">
              <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{supplierName}</h1>
              {supplier.verified && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] uppercase font-bold tracking-widest rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Supplier
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-gray-400 font-medium">
              <span className="flex items-center gap-1.5"><Package className="w-4 h-4" /> {products.length} Products</span>
              {supplier.email && <span className="flex items-center gap-1.5"><Mail className="w-4 h-4" /> {supplier.email}</span>}
              <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> Kathmandu, Nepal</span>
            </div>
          </div>

          <div className="mt-6 md:mt-0 flex gap-3 w-full md:w-auto z-20">
            <button
              onClick={handleChat}
              className="flex-1 md:flex-none px-6 py-3.5 bg-emerald-500 text-black text-sm font-bold uppercase tracking-widest hover:bg-emerald-400 transition flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" /> Message Supplier
            </button>
          </div>
        </div>
      </div>

      {/* STRIP */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-[72px] z-40">
        <div className="max-w-screen-xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex gap-8 h-full">
            <button className="h-full px-2 border-b-2 border-emerald-500 text-black font-semibold text-sm">All Products</button>
            <button className="h-full px-2 border-b-2 border-transparent text-gray-500 hover:text-black font-semibold text-sm transition">About Store</button>
          </div>
        </div>
      </div>

      <main className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-xl font-bold text-gray-900">Featured Inventory</h2>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {products.map((product, i) => {
            const price = getDisplayPrice(product);
            const isOutOfStock = product.stock === 0;

            return (
              <motion.div
                key={product._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.05, 0.5) }}
                className="group cursor-pointer bg-white rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
                onClick={() => navigate(`/marketplace/product/${product._id}`)}
              >
                <div className="aspect-square bg-[#f5f5f5] relative overflow-hidden flex items-center justify-center">
                  {product.image ? (
                    <img src={`http://localhost:5000${product.image}`} alt={product.name} className="w-full h-full object-contain p-4 group-hover:scale-105 transition duration-500" />
                  ) : (
                    <Package className="w-12 h-12 text-gray-300" />
                  )}
                  {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-[2px] flex items-center justify-center">
                      <span className="bg-black text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1">Out of Stock</span>
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">{product.category?.name || "General"}</p>
                  <h3 className="text-sm font-semibold text-gray-900 line-clamp-1 mb-2">{product.name}</h3>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-sm font-black text-emerald-600">Rs {Number(price).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </main>

    </div>
  );
}
