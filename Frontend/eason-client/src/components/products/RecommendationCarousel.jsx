import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Package, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { useCart } from "../../context/CartContext";

export default function RecommendationCarousel({ productId, onProductClick }) {
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addToCart, getAvailableStock } = useCart();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        const res = await API.get(`/products/${productId}/recommendations`);
        setRecommendations(res.data || []);
      } catch (error) {
        console.error("Failed to fetch recommendations:", error);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchRecommendations();
    }
  }, [productId]);

  if (loading) {
    return (
      <div className="py-8 animate-pulse">
        <h3 className="text-xl font-bold mb-4 bg-gray-200 h-6 w-64 rounded"></h3>
        <div className="flex gap-4 overflow-hidden">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="w-48 h-64 bg-gray-100 rounded-xl shrink-0"></div>
          ))}
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // Don't render anything if no recommendations
  }

  const getDisplayPrice = (product) => {
    const info = product.priceInfo || {};
    return info.finalPrice || info.purchasePrice || info.sellingPrice || product.wholesalerPrice || 0;
  };

  const handleActionClick = (e, product) => {
    e.stopPropagation();
    addToCart(product);
  };

  const handleClick = (product) => {
    if (onProductClick) {
      onProductClick(product);
    } else {
      navigate(`/marketplace/product/${product._id}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  return (
    <div className="mt-16 mb-12 border-t border-gray-100 pt-12">
      <h3 className="text-2xl font-bold text-gray-900 mb-6 tracking-tight">
        Frequently Bought Together
      </h3>
      <div className="flex gap-5 overflow-x-auto pb-6 scrollbar-hide snap-x">
        {recommendations.map((product) => {
          const availableStock = getAvailableStock(product._id, product.stock);
          const isOutOfStock = availableStock === 0;

          return (
            <motion.div
              key={product._id}
              whileHover={{ y: -5 }}
              onClick={() => !isOutOfStock && handleClick(product)}
              className={`w-52 shrink-0 group cursor-pointer snap-start ${isOutOfStock ? "opacity-50 pointer-events-none" : ""}`}
            >
              {/* Image Container */}
              <div className="relative aspect-square bg-[#f5f5f5] rounded-xl overflow-hidden mb-3">
                {product.image ? (
                  <img
                    src={`http://localhost:5000${product.image}`}
                    alt={product.name}
                    className="w-full h-full object-contain p-4 mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-300" />
                  </div>
                )}
                
                {!isOutOfStock && (
                  <button
                    onClick={(e) => handleActionClick(e, product)}
                    className="absolute bottom-3 right-3 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110 shadow-lg"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Text Info */}
              <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1 line-clamp-1">
                {product.category?.name || "General"}
              </p>
              <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
                {product.name}
              </h4>
              <p className="text-sm font-bold text-emerald-600">
                Rs {Number(getDisplayPrice(product)).toLocaleString()}
              </p>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
