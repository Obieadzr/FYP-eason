// src/pages/retailer/Marketplace.jsx
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  Search,
  ShoppingBag,
  User,
  ChevronDown,
  Package,
  LogOut,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import ason2 from "../../assets/ason2.jpg";
import { useCart } from "../../context/CartContext.jsx";
import { useAuthStore } from "../../store/authStore.js";
import toast from "react-hot-toast";

export default function Marketplace() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuthStore();

  // Debug: See what's happening with user state
  console.log("Marketplace DEBUG:", {
    authLoading,
    userExists: !!user,
    userData: user ? `${user.fullName} (${user.role})` : "null",
  });

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);

  const { cartCount, addToCart, getAvailableStock } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products");
        setProducts(res.data || []);
        setFilteredProducts(res.data || []);
      } catch (err) {
        console.error("Failed to fetch products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter((p) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category?.name === selectedCategory);
    }

    if (sortBy === "Newest") {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } else if (sortBy === "Price Low to High") {
      filtered.sort((a, b) => {
        const aPrice =
          a.priceInfo?.purchasePrice ||
          a.priceInfo?.finalPrice ||
          a.wholesalerPrice ||
          a.price ||
          0;
        const bPrice =
          b.priceInfo?.purchasePrice ||
          b.priceInfo?.finalPrice ||
          b.wholesalerPrice ||
          b.price ||
          0;
        return aPrice - bPrice;
      });
    } else if (sortBy === "Price High to Low") {
      filtered.sort((a, b) => {
        const aPrice =
          a.priceInfo?.purchasePrice ||
          a.priceInfo?.finalPrice ||
          a.wholesalerPrice ||
          a.price ||
          0;
        const bPrice =
          b.priceInfo?.purchasePrice ||
          b.priceInfo?.finalPrice ||
          b.wholesalerPrice ||
          b.price ||
          0;
        return bPrice - aPrice;
      });
    }

    setFilteredProducts(filtered);
  }, [searchQuery, selectedCategory, sortBy, products]);

  const categories = ["All", ...new Set(products.map((p) => p.category?.name).filter(Boolean))];

  const isNew = (date) => new Date(date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const getDisplayPrice = (product) => {
    const info = product.priceInfo || {};
    const legacy = product.price || product.wholesalerPrice || 0;
    if (!user) return info.finalPrice || legacy;
    if (user.role === "retailer") return info.purchasePrice || legacy;
    if (user.role === "wholesaler") return info.sellingPrice || legacy;
    return info.finalPrice || legacy;
  };

  const getPriceLabel = () => {
    if (!user) return "Price";
    if (user.role === "retailer") return "Your Buy Price";
    if (user.role === "wholesaler") return "Your Sell Price";
    return "Price";
  };

  const getSuggestedPrice = (product) => {
    return (
      product.priceInfo?.suggestedSellingPrice ||
      Math.round((product.wholesalerPrice || product.price || 0) * 1.38)
    );
  };

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out and redirected to the home page",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#10b981",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
      cancelButtonText: "Cancel",
      customClass: {
        popup: "rounded-2xl border border-gray-200 shadow-2xl",
        title: "text-gray-900 font-bold",
        htmlContainer: "text-gray-600",
        confirmButton: "rounded-xl px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white",
        cancelButton: "rounded-xl px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800",
      },
      buttonsStyling: false,
    }).then((result) => {
      if (result.isConfirmed) {
        logout();
        toast.success("Logged out successfully!", { duration: 2000 });
        navigate("/", { replace: true });
      }
    });
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url("https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap");
        html,
        body,
        * {
          font-family: "Satoshi", -apple-system, sans-serif;
          letter-spacing: -0.02em;
        }
      `}</style>

      {/* NAVBAR */}
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="fixed inset-x-4 top-4 z-50 mx-auto max-w-7xl rounded-3xl bg-white/90 backdrop-blur-xl shadow-xl border border-gray-100"
      >
        <div className="px-8 py-5 flex items-center justify-between">
          <motion.h1
            onClick={() => navigate("/")}
            className="text-2xl font-bold text-gray-900 cursor-pointer hover:opacity-80 transition"
            whileHover={{ scale: 1.05 }}
          >
            eAson<span className="text-emerald-600">.</span>
          </motion.h1>

          <div className="hidden md:flex items-center gap-10 font-medium text-gray-600">
            <button className="hover:text-emerald-600 transition">Shop</button>
            <button className="hover:text-emerald-600 transition">New Stock</button>
          </div>

          <div className="flex items-center gap-6">
            <Search className="w-5 h-5 text-gray-600 cursor-pointer hover:text-emerald-600 transition" />
            <User className="w-5 h-5 text-gray-600 cursor-pointer hover:text-emerald-600 transition" />

            <div
              className="relative cursor-pointer"
              onClick={() => navigate("/cart")}
            >
              <ShoppingBag className="w-5 h-5 text-gray-600 hover:text-emerald-600 transition" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>

            {/* Logout Button – ONLY when user is logged in */}
            {user && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl transition font-medium"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </motion.nav>

      <div className="h-32" />

      {/* HERO */}
      <section className="relative h-screen max-h-[720px] overflow-hidden bg-gradient-to-b from-[#fafafa] to-white">
        <img src={ason2} alt="Ason Market" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-white via-white/30 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 p-10 md:p-20 max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
          >
            <h1 className="text-7xl md:text-9xl font-light leading-none text-white">
              Ason<br />
              <span className="font-normal text-emerald-400">Rebuilt.</span>
            </h1>
            <p className="text-2xl md:text-4xl font-light mt-6 text-white/90">
              The market never sleeps.<br />
              Now you don’t have to.
            </p>
          </motion.div>
        </div>
      </section>

      {/* SEARCH + SORT */}
      <div className="max-w-7xl mx-auto px-6 pt-20">
        <div className="flex flex-col lg:flex-row gap-8 items-start lg:items-center justify-between">
          <div className="w-full lg:w-auto">
            <p className="text-sm font-medium text-gray-600 mb-3">SEARCH</p>
            <div className="relative max-w-xl">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Find items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white border border-gray-200 rounded-xl text-lg focus:outline-none focus:border-emerald-600 transition"
              />
            </div>
          </div>

          <div className="w-full lg:w-auto">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-xl px-6 py-4 pr-12 text-lg font-medium text-gray-900 focus:outline-none focus:border-emerald-600 cursor-pointer"
              >
                <option>Newest</option>
                <option>Price Low to High</option>
                <option>Price High to Low</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES + GRID */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-20">
        <div className="grid lg:grid-cols-4 gap-12">
          <div className="lg:col-span-1">
            <p className="text-sm font-medium text-gray-600 mb-6">CATEGORIES</p>
            <div className="space-y-4">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`block text-left text-lg font-medium transition ${
                    selectedCategory === cat ? "text-emerald-600" : "text-gray-700 hover:text-gray-900"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
              {filteredProducts.map((product, i) => {
                const availableStock = getAvailableStock(product._id, product.stock);

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/marketplace/product/${product._id}`)}
                  >
                    <div className="aspect-square bg-gray-50 rounded-2xl overflow-hidden mb-4 relative">
                      {product.image ? (
                        <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                      {isNew(product.createdAt) && (
                        <div className="absolute top-4 left-4 bg-black text-white text-xs font-bold px-3 py-1 rounded">
                          NEW
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">
                        {product.category?.name || "General"}
                      </p>

                      <h3 className="font-medium text-gray-900 line-clamp-2 group-hover:text-emerald-600 transition">
                        {product.name}
                      </h3>

                      <div className="mt-4">
                        <p className="text-lg font-bold text-gray-900">
                          {getPriceLabel()}: Rs{" "}
                          {Number(getDisplayPrice(product)).toLocaleString() || "—"}
                        </p>

                        {user?.role === "retailer" && (
                          <p className="text-sm text-gray-600 mt-1">
                            Suggested sell: Rs{" "}
                            {Number(getSuggestedPrice(product)).toLocaleString()}
                          </p>
                        )}

                        <p className="text-sm text-gray-600 mt-1">
                          {availableStock > 10
                            ? "In Stock"
                            : availableStock > 0
                            ? `Only ${availableStock} left`
                            : "Out of Stock"}
                        </p>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          addToCart(product);
                        }}
                        disabled={availableStock === 0}
                        className={`mt-3 w-full py-2 px-4 rounded-xl font-medium transition ${
                          availableStock === 0
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-gray-900 text-white hover:bg-black"
                        }`}
                      >
                        {availableStock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}