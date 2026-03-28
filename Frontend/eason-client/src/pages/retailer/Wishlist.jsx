// src/pages/retailer/Wishlist.jsx
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, ShoppingCart, ArrowLeft, Package, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useAuthStore } from "../../store/authStore";
import toast from "react-hot-toast";
import API from "../../utils/api";

const FONT = { fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" };

export default function Wishlist() {
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState([]);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("eason_wishlist")) || []; }
    catch { return []; }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isAuthenticated) {
      API.get('/wishlist').then(r => {
        setProducts(r.data);
        setWishlist(r.data.map(p => p._id));
      }).catch(() => null).finally(() => setLoading(false));
    } else {
      if (!wishlist.length) { setLoading(false); return; }
      Promise.all(wishlist.map(id => API.get(`/products/${id}`).then(r => r.data).catch(() => null)))
        .then(results => setProducts(results.filter(Boolean)))
        .finally(() => setLoading(false));
    }
  }, [isAuthenticated]);

  const removeFromWishlist = async (id) => {
    const next = wishlist.filter(x => x !== id);
    setWishlist(next);
    setProducts(p => p.filter(x => x._id !== id));
    
    if (isAuthenticated) {
       try { await API.post('/wishlist/toggle', { productId: id }); } catch (e) {}
    } else {
       localStorage.setItem("eason_wishlist", JSON.stringify(next));
    }
    toast("Removed from wishlist", { icon: "💔" });
  };

  const handleMoveToCart = (product) => {
    addToCart(product, 1);
    removeFromWishlist(product._id);
    toast.success("Moved to cart!");
  };

  const getPrice = (p) => {
    const info = p.priceInfo || {};
    return info.purchasePrice || info.finalPrice || p.wholesalerPrice || p.price || 0;
  };

  return (
    <div className="min-h-screen bg-white" style={FONT}>
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate("/marketplace")}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </button>
          <span className="text-lg font-bold text-gray-900 tracking-tight">
            eAson<span className="text-emerald-500">.</span>
          </span>
          <div className="w-32" />
        </div>
      </header>

      <div className="max-w-screen-xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-3 mb-10">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            My Wishlist
            <span className="ml-2 text-base font-normal text-gray-400">({wishlist.length} items)</span>
          </h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : products.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 gap-5"
          >
            <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center">
              <Heart className="w-9 h-9 text-gray-300" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Your wishlist is empty</h2>
            <p className="text-sm text-gray-400">Save products you love by clicking the heart icon.</p>
            <button
              onClick={() => navigate("/marketplace")}
              className="mt-2 px-8 py-3.5 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition"
            >
              Browse Products
            </button>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {products.map(product => (
                <motion.div
                  key={product._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white border border-gray-100 group hover:border-gray-300 transition overflow-hidden flex flex-col"
                >
                  {/* Image */}
                  <div
                    className="relative aspect-square bg-gray-50 overflow-hidden cursor-pointer"
                    onClick={() => navigate(`/marketplace/product/${product._id}`)}
                  >
                    {product.image
                      ? <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                      : <Package className="w-12 h-12 text-gray-300 m-auto absolute inset-0 my-auto" />
                    }
                    {/* Remove button */}
                    <button
                      onClick={(e) => { e.stopPropagation(); removeFromWishlist(product._id); }}
                      className="absolute top-3 right-3 w-8 h-8 bg-white shadow-sm border border-gray-100 rounded-full flex items-center justify-center text-rose-400 hover:bg-rose-50 hover:text-rose-600 transition opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
                        {product.category?.name || "General"}
                      </p>
                      <p className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2">
                        {product.name}
                      </p>
                      <p className="text-sm font-bold text-gray-900 mt-1">
                        Rs {Number(getPrice(product)).toLocaleString()}
                      </p>
                    </div>

                    <button
                      onClick={() => handleMoveToCart(product)}
                      className="w-full flex items-center justify-center gap-2 py-2.5 bg-black text-white text-xs font-bold uppercase tracking-widest hover:bg-gray-800 transition"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      Move to Cart
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
