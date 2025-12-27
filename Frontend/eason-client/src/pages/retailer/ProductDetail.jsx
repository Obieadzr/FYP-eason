// src/pages/retailer/ProductDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Minus, Package } from "lucide-react";
import API from "../../utils/api";
import { useCart } from "../../context/CartContext.jsx";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
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
    // Optional: show success toast or redirect to cart
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-gray-600 hover:text-gray-900 mb-8 transition"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Marketplace
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left: Images */}
          <div className="space-y-6">
            {/* Main Image */}
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-xl">
              <img
                src={selectedImage || `http://localhost:5000${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnail Gallery - For now, show main image only (you can add more later) */}
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
              {/* Add more thumbnails if you have multiple images later */}
              <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-300" />
              </div>
              <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-300" />
              </div>
              <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-300" />
              </div>
            </div>
          </div>

          {/* Right: Details */}
          <div className="space-y-8">
            <div>
              <p className="text-sm text-gray-500 uppercase tracking-wider mb-2">
                {product.category?.name || "General"}
              </p>
              <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
              <p className="text-3xl font-bold text-emerald-600">
                Rs {product.price.toLocaleString()}
              </p>
            </div>

            {/* Stock Info */}
            <div className="flex items-center gap-3">
              <Package className="w-5 h-5 text-gray-600" />
              <p className={`font-medium ${product.stock > 10 ? "text-gray-700" : product.stock > 0 ? "text-orange-600" : "text-red-600"}`}>
                {product.stock > 10
                  ? "In Stock"
                  : product.stock > 0
                  ? `Only ${product.stock} left!`
                  : "Out of Stock"}
              </p>
            </div>

            {/* Quantity Selector */}
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

            {/* Add to Cart Button */}
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="w-full py-5 bg-emerald-600 text-white text-xl font-bold rounded-2xl hover:bg-emerald-700 transition shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
            </button>

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