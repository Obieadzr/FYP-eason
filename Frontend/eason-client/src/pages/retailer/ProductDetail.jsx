// src/pages/retailer/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Package } from "lucide-react";
import API from "../../utils/api";
import { useCart } from "../../context/CartContext.jsx";
import { useAuthStore } from "../../store/authStore.js"; // ← Fixed to Zustand

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore(); // ← Use Zustand (not old AuthContext)
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);

  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
        setSelectedImage(`http://localhost:5000${res.data.image}`);
      } catch (err) {
        console.error("Failed to fetch product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-600">Product not found</p>
      </div>
    );
  }

  const handleAddToCart = () => {
    addToCart(product, quantity);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/cart");
  };

  // Safe price helpers
  const getDisplayPrice = () => {
    const info = product.priceInfo || {};
    const legacy = product.price || product.wholesalerPrice || 0;
    if (!user) return info.finalPrice || legacy;
    if (user.role === "retailer") return info.purchasePrice || legacy;
    if (user.role === "wholesaler") return info.sellingPrice || legacy;
    return info.finalPrice || legacy;
  };

  const getPriceLabel = () => {
    if (!user) return "Price";
    if (user.role === "retailer") return "Your Purchase Price";
    if (user.role === "wholesaler") return "Your Selling Price";
    return "Price";
  };

  const getSuggestedPrice = () => {
    return product.priceInfo?.suggestedSellingPrice || Math.round((product.wholesalerPrice || product.price || 0) * 1.38);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Marketplace
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Images */}
          <div className="space-y-6">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-xl">
              <img
                src={selectedImage || `http://localhost:5000${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-4 gap-4">
              <div
                className={`aspect-square bg-white rounded-2xl overflow-hidden cursor-pointer border-2 transition ${
                  selectedImage === `http://localhost:5000${product.image}` ? "border-emerald-600" : "border-gray-200"
                }`}
                onClick={() => setSelectedImage(`http://localhost:5000${product.image}`)}
              >
                <img
                  src={`http://localhost:5000${product.image}`}
                  alt="thumbnail"
                  className="w-full h-full object-cover"
                />
              </div>
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                  <Package className="w-12 h-12 text-gray-300" />
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                {product.category?.name || "General"}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>

              {/* Price */}
              <div className="text-3xl font-bold text-emerald-600">
                {getPriceLabel()}: Rs {Number(getDisplayPrice()).toLocaleString() || "—"}
              </div>

              {/* Retailer suggestion */}
              {user?.role === "retailer" && (
                <p className="text-sm text-gray-600 mt-2">
                  Suggested selling price: Rs {Number(getSuggestedPrice()).toLocaleString()}
                  <br />
                  <span className="text-xs text-gray-500">(override available in future updates)</span>
                </p>
              )}
            </div>

            {/* Stock */}
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-600" />
              <p
                className={`font-medium ${
                  product.stock > 10 ? "text-gray-700" : product.stock > 0 ? "text-orange-600" : "text-red-600"
                }`}
              >
                {product.stock > 10
                  ? "In Stock"
                  : product.stock > 0
                  ? `Only ${product.stock} left!`
                  : "Out of Stock"}
              </p>
            </div>

            {/* Quantity + Cart + Buy Now (hide for wholesaler) */}
            {user?.role !== "wholesaler" && (
              <>
                <div className="flex items-center gap-6">
                  <p className="text-lg font-medium text-gray-900">Quantity</p>
                  <div className="flex items-center border border-gray-300 rounded-xl">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover:bg-gray-100 rounded-l-xl transition"
                      disabled={product.stock === 0}
                    >
                      <Minus className="w-5 h-5" />
                    </button>
                    <span className="px-8 py-3 font-semibold text-lg">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 10, quantity + 1))}
                      className="p-3 hover:bg-gray-100 rounded-r-xl transition"
                      disabled={product.stock === 0}
                    >
                      <Plus className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock === 0}
                    className="w-full py-5 bg-gray-900 text-white text-xl font-bold rounded-2xl hover:bg-black transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>

                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock === 0}
                    className="w-full py-5 bg-emerald-600 text-white text-xl font-bold rounded-2xl hover:bg-emerald-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {product.stock === 0 ? "Out of Stock" : "Buy Now"}
                  </button>
                </div>
              </>
            )}

            {/* Description */}
            {product.description && (
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}