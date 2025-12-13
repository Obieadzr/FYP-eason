// src/pages/retailer/ProductDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../utils/api";
import { ArrowLeft, ShoppingBag, Star, Package, Truck } from "lucide-react";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await API.get(`/products/${id}`);
        setProduct(res.data);
      } catch (err) {
        console.error("Failed to load product:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-xl text-gray-500">Product not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-gray-700 hover:text-gray-900 mb-8"
        >
          <ArrowLeft className="w-6 h-6" />
          Back to Marketplace
        </button>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image */}
          <div className="aspect-square bg-white rounded-3xl shadow-lg overflow-hidden">
            {product.image ? (
              <img
                src={`http://localhost:5000${product.image}`}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-100">
                <Package className="w-32 h-32 text-gray-300" />
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>
              <p className="text-xl text-gray-500 mt-2">{product.category?.name} • {product.unit?.name}</p>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-5xl font-black text-gray-900">₹{product.price}</p>
                  <p className="text-gray-500 mt-2">{product.stock} units available</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-medium text-gray-600">Wholesale Price</p>
                  <p className="text-sm text-gray-500">Min order: 10 units</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <button className="py-5 bg-black text-white rounded-2xl font-bold text-lg hover:bg-gray-800 transition">
                  Add to Cart
                </button>
                <button className="py-5 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-700 transition flex items-center justify-center gap-3">
                  <ShoppingBag className="w-6 h-6" />
                  Buy Now
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Description</h3>
              <p className="text-gray-600 leading-relaxed">
                {product.description || "No description available."}
              </p>
            </div>

            <div className="flex items-center gap-8 text-sm">
              <div className="flex items-center gap-3">
                <Truck className="w-5 h-5 text-gray-500" />
                <span>Free delivery above ₹5000</span>
              </div>
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-gray-500" />
                <span>COD Available</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}