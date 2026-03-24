// src/pages/retailer/Marketplace.jsx
import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  Search,
  ShoppingBag,
  Heart,
  Package,
  LogOut,
  Plus,
  ChevronDown,
  X,
  SlidersHorizontal,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import API from "../../utils/api";
import ason2 from "../../assets/ason2.jpg";
import { useCart } from "../../context/CartContext.jsx";
import { useAuthStore } from "../../store/authStore.js";
import toast from "react-hot-toast";

// ─── Helpers ───────────────────────────────────────────────────────────────
const FONT_URL = "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap";
const FONT_STYLE = { fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" };

export default function Marketplace() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState([]);

  const { cartCount, addToCart, getAvailableStock } = useCart();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await API.get("/products");
        setProducts(res.data || []);
        setFilteredProducts(res.data || []);
      } catch {
        toast.error("Failed to load products");
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let f = [...products];
    if (debouncedSearch) f = f.filter(p => p.name.toLowerCase().includes(debouncedSearch.toLowerCase()));
    if (selectedCategory !== "All") f = f.filter(p => p.category?.name === selectedCategory);
    if (minPrice) f = f.filter(p => (p.priceInfo?.finalPrice || p.wholesalerPrice || p.price || 0) >= Number(minPrice));
    if (maxPrice) f = f.filter(p => (p.priceInfo?.finalPrice || p.wholesalerPrice || p.price || 0) <= Number(maxPrice));
    if (sortBy === "Newest") f.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "Price Low to High") f.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    else if (sortBy === "Price High to Low") f.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    setFilteredProducts(f);
  }, [debouncedSearch, selectedCategory, sortBy, minPrice, maxPrice, products]);

  const categories = ["All", ...new Set(products.map(p => p.category?.name).filter(Boolean))];
  const isNew = (date) => new Date(date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const getDisplayPrice = (product) => {
    const info = product.priceInfo || {};
    const legacy = product.price || product.wholesalerPrice || 0;
    if (!user) return info.finalPrice || legacy;
    if (user.role === "retailer") return info.purchasePrice || legacy;
    if (user.role === "wholesaler") return info.sellingPrice || legacy;
    return info.finalPrice || legacy;
  };

  const getSuggestedPrice = (product) =>
    product.priceInfo?.suggestedSellingPrice ||
    Math.round((product.wholesalerPrice || product.price || 0) * 1.38);

  const toggleWishlist = (id) => setWishlist(w => w.includes(id) ? w.filter(x => x !== id) : [...w, id]);

  const handleLogout = () => {
    Swal.fire({
      title: "SIGN OUT?", text: "You'll be redirected to the home page.",
      showCancelButton: true,
      confirmButtonText: "Sign out", cancelButtonText: "Cancel",
      customClass: {
        popup: "!rounded-none !border !border-gray-200 !shadow-2xl !p-8",
        title: "!text-2xl !font-bold !tracking-tight !text-black !uppercase",
        htmlContainer: "!text-gray-500 !text-sm !tracking-widest !uppercase !font-bold !mt-2",
        actions: "!mt-8 !flex !gap-4 !w-full !px-4",
        confirmButton: "!flex-1 !bg-black !text-white !font-bold !uppercase !tracking-widest !py-4 !text-xs !transition-colors hover:!bg-gray-800",
        cancelButton: "!flex-1 !bg-white !text-black !border !border-gray-200 !font-bold !uppercase !tracking-widest !py-4 !text-xs !transition-colors hover:!border-black",
      },
      buttonsStyling: false,
    }).then(r => {
      if (r.isConfirmed) { logout(); navigate("/", { replace: true }); }
    });
  };

  const requireAuth = (cb) => {
    if (!user) {
      Swal.fire({
        title: "SIGN IN REQUIRED", text: "Create an account to start ordering.",
        showCancelButton: true,
        confirmButtonText: "Create account", cancelButtonText: "Cancel",
        buttonsStyling: false,
        customClass: {
          popup: "!rounded-none !border !border-gray-200 !shadow-2xl !p-8",
          title: "!text-2xl !font-bold !tracking-tight !text-black !uppercase",
          htmlContainer: "!text-gray-500 !text-sm !tracking-widest !uppercase !font-bold !mt-2",
          actions: "!mt-8 !flex !gap-4 !w-full !px-4",
          confirmButton: "!flex-1 !bg-black !text-white !font-bold !uppercase !tracking-widest !py-4 !text-xs !transition-colors hover:!bg-gray-800",
          cancelButton: "!flex-1 !bg-white !text-black !border !border-gray-200 !font-bold !uppercase !tracking-widest !py-4 !text-xs !transition-colors hover:!border-black",
        }
      }).then(r => { if (r.isConfirmed) navigate("/register"); });
      return;
    }
    cb();
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-[#111] flex items-center justify-center" style={FONT_STYLE}>
        <link href={FONT_URL} rel="stylesheet" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-gray-700 border-t-emerald-500 rounded-full animate-spin" />
          <p className="text-gray-500 text-sm tracking-wide">Loading products</p>
        </div>
      </div>
    );
  }

  const navCategories = [
    "All Products",
    "Food & Beverages",
    "FMCG & Household",
    "Electronics",
    "Bulk Orders",
    "New Arrivals",
  ];

  return (
    <>
      <link href={FONT_URL} rel="stylesheet" />

      <div className="min-h-screen bg-white" style={FONT_STYLE}>

        {/* ─────────────────────── DARK NIKE-STYLE NAVBAR ─────────────────────── */}
        <header className="bg-[#111111] sticky top-0 z-50">
          {/* Top utility bar */}
          {user && (
            <div className="border-b border-white/5 px-6 py-1.5 flex items-center justify-end gap-4 text-xs text-gray-500 max-w-screen-2xl mx-auto">
              <span>Welcome, {user.firstName}</span>
              {user.role === "wholesaler" && user.verified && (
                <button onClick={() => navigate("/add-product")} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition font-medium">
                  <Plus className="w-3 h-3" /> Add Product
                </button>
              )}
              {user.role === "admin" && (
                <button onClick={() => navigate("/dashboard")} className="text-purple-400 hover:text-purple-300 transition font-medium">
                  Admin Panel
                </button>
              )}
              <button onClick={handleLogout} className="flex items-center gap-1 hover:text-white transition">
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            </div>
          )}

          {/* Main nav */}
          <nav className="px-6 py-4 flex items-center gap-8 max-w-screen-2xl mx-auto">
            {/* Logo — stays in marketplace */}
            <button
              onClick={() => navigate("/marketplace")}
              className="text-white text-xl font-bold tracking-tight shrink-0 hover:opacity-80 transition mr-4"
            >
              eAson<span className="text-emerald-400">.</span>
            </button>

            {/* Category links — Nike style */}
            <div className="hidden md:flex items-center gap-6 flex-1">
              {navCategories.map(cat => {
                const mapped = cat === "All Products" ? "All" : cat.split(" ")[0];
                const active = selectedCategory === (cat === "All Products" ? "All" : products.find(p => p.category?.name?.toLowerCase().startsWith(cat.split(" ")[0].toLowerCase()))?.category?.name || cat);
                return (
                  <button
                    key={cat}
                    onClick={() => {
                      if (cat === "All Products") setSelectedCategory("All");
                      else if (cat === "New Arrivals") { setSelectedCategory("All"); setSortBy("Newest"); }
                      else {
                        const match = categories.find(c => c.toLowerCase().includes(cat.split(" ")[0].toLowerCase()));
                        setSelectedCategory(match || "All");
                      }
                    }}
                    className="text-sm font-medium text-gray-300 hover:text-white transition whitespace-nowrap"
                  >
                    {cat}
                  </button>
                );
              })}
            </div>

            {/* Right icons */}
            <div className="flex items-center gap-3 ml-auto shrink-0">
              {/* Search */}
              <div className="relative hidden md:flex items-center">
                <AnimatePresence mode="wait">
                  {searchOpen ? (
                    <motion.div
                      key="search-input"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 280, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      className="relative flex items-center"
                    >
                      <input
                        autoFocus
                        type="text"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        onFocus={() => setShowSuggestions(true)}
                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                        placeholder="SEARCH..."
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-500 rounded-none px-4 py-2 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-white transition-colors pr-10"
                      />
                      <button onClick={() => setSearchOpen(false)} className="absolute right-3 text-white/50 hover:text-white transition">
                        <X className="w-4 h-4" />
                      </button>
                      
                      {/* Suggestions */}
                      <AnimatePresence>
                        {showSuggestions && searchQuery && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-full mt-2 w-full bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-50"
                          >
                            {filteredProducts.length > 0 ? filteredProducts.slice(0, 6).map(p => (
                              <button
                                key={p._id}
                                onClick={() => navigate(`/marketplace/product/${p._id}`)}
                                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/5 text-sm text-gray-300 hover:text-white transition border-b border-white/5 last:border-0"
                              >
                                <span>{p.name}</span>
                                <span className="text-emerald-400 text-xs font-semibold">Rs {Number(getDisplayPrice(p)).toLocaleString()}</span>
                              </button>
                            )) : (
                              <div className="px-4 py-3 text-gray-500 text-sm">No results</div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ) : (
                    <motion.button
                      key="search-button"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSearchOpen(true)}
                      className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-none text-xs font-bold tracking-widest uppercase transition-colors"
                    >
                      <Search className="w-4 h-4" />
                      <span className="hidden lg:inline">Search</span>
                    </motion.button>
                  )}
                </AnimatePresence>
              </div>

              {/* Wishlist */}
              <button className="relative p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10">
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {wishlist.length}
                  </span>
                )}
              </button>

              {/* Orders */}
              {user?.role === "retailer" && (
                <button
                  onClick={() => navigate("/orders")}
                  className="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10"
                >
                  <Package className="w-5 h-5" />
                </button>
              )}

              {/* Cart */}
              <button
                onClick={() => navigate("/cart")}
                className="relative p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>

              {/* Account / Profile */}
              <button
                onClick={() => navigate(user ? "/profile" : "/login")}
                className="flex items-center gap-2 p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10"
              >
                {user
                  ? <div className="w-7 h-7 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {user.firstName?.[0]?.toUpperCase()}
                    </div>
                  : <User className="w-5 h-5" />
                }
              </button>
            </div>
          </nav>
        </header>

        {/* ─────────────────────── HERO ───────────────────────────────────────── */}
        <section className="relative h-[85vh] min-h-[560px] overflow-hidden bg-[#0a0a0a]">
          <img
            src={ason2}
            alt="eAson Market"
            className="w-full h-full object-cover opacity-60"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Hero content */}
          <div className="absolute inset-0 flex items-end pb-16 px-10 md:px-20 max-w-screen-2xl mx-auto left-0 right-0">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="text-emerald-400 text-sm font-medium tracking-[0.2em] uppercase mb-4">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', year: 'numeric' })}
              </p>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-light text-white leading-none tracking-tight">
                Shop<br />
                <span className="font-semibold italic text-transparent bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text">
                  Wholesale.
                </span>
              </h1>
              <p className="text-white/50 text-lg md:text-xl mt-6 font-light max-w-md">
                Factory-direct pricing. Real-time stock across Kathmandu.
              </p>
              <div className="flex gap-4 mt-10">
                <button
                  onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                  className="px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-gray-100 transition text-sm tracking-wide"
                >
                  Shop Now
                </button>
                {!user && (
                  <button
                    onClick={() => navigate("/register")}
                    className="px-8 py-4 bg-transparent border border-white/30 text-white font-medium rounded-full hover:bg-white/10 transition text-sm"
                  >
                    Create Account
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─────────────────────── CATEGORY EDITORIAL STRIP ───────────────────── */}
        <section className="bg-[#f5f5f5] border-b border-gray-200">
          <div className="max-w-screen-2xl mx-auto px-6 py-5 flex items-center gap-3 overflow-x-auto scrollbar-hide">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-black text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ─────────────────────── MAIN CONTENT ───────────────────────────────── */}
        <main className="max-w-screen-2xl mx-auto px-6 py-10" id="products-grid">

          {/* Sort / Filter bar */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-semibold text-gray-900">
                {selectedCategory === "All" ? "All Products" : selectedCategory}
              </h2>
              <span className="text-sm text-gray-400">({filteredProducts.length})</span>
            </div>

            <div className="flex items-center gap-3">
              {/* Mobile search */}
              <div className="md:hidden relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/30 w-40"
                />
              </div>

              {/* Filters toggle */}
              <button
                onClick={() => setFiltersOpen(!filtersOpen)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 transition"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>

              {/* Sort */}
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="appearance-none pl-4 pr-8 py-2 border border-gray-200 rounded-full text-sm font-medium text-gray-700 focus:outline-none focus:border-gray-400 cursor-pointer bg-white"
                >
                  <option>Newest</option>
                  <option>Price Low to High</option>
                  <option>Price High to Low</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500 pointer-events-none" />
              </div>

              {/* Wholesaler add */}
              {user?.role === "wholesaler" && user.verified && (
                <button
                  onClick={() => navigate("/add-product")}
                  className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-medium hover:bg-emerald-700 transition"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              )}
            </div>
          </div>

          {/* Expandable filters */}
          <AnimatePresence>
            {filtersOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mb-8"
              >
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 text-sm">Price Range</h3>
                    {(minPrice || maxPrice) && (
                      <button onClick={() => { setMinPrice(""); setMaxPrice(""); }} className="text-xs text-red-500 hover:text-red-700 font-medium">
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-3 max-w-xs">
                    <input
                      type="number" placeholder="Min (Rs)" value={minPrice}
                      onChange={e => setMinPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-gray-400 text-sm">–</span>
                    <input
                      type="number" placeholder="Max (Rs)" value={maxPrice}
                      onChange={e => setMaxPrice(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Products grid — Nike style */}
          {filteredProducts.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <Package className="w-16 h-16 text-gray-200 mb-6" />
              <h3 className="text-2xl font-semibold text-gray-800 mb-2">No products found</h3>
              <p className="text-gray-400 max-w-sm text-sm mb-8">Try a different category or clear your filters.</p>
              <button
                onClick={() => { setSearchQuery(""); setSelectedCategory("All"); setMinPrice(""); setMaxPrice(""); }}
                className="px-8 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
              >
                Clear Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-5 gap-y-10">
              {filteredProducts.map((product, i) => {
                const availableStock = getAvailableStock(product._id, product.stock);
                const inWishlist = wishlist.includes(product._id);
                const price = getDisplayPrice(product);

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    className="group cursor-pointer"
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-square bg-[#f5f5f5] rounded-2xl overflow-hidden mb-4"
                      onClick={() => navigate(`/marketplace/product/${product._id}`)}
                    >
                      {product.image ? (
                        <img
                          src={`http://localhost:5000${product.image}`}
                          alt={product.name}
                          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="w-12 h-12 text-gray-300" />
                        </div>
                      )}

                      {/* Badges */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                        {isNew(product.createdAt) && (
                          <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded">NEW</span>
                        )}
                        {availableStock <= 5 && availableStock > 0 && (
                          <span className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded">
                            {availableStock} LEFT
                          </span>
                        )}
                        {availableStock === 0 && (
                          <span className="bg-gray-400 text-white text-[10px] font-bold px-2.5 py-1 rounded">SOLD OUT</span>
                        )}
                      </div>

                      {/* Wishlist */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleWishlist(product._id); }}
                        className={`absolute top-3 right-3 p-2 rounded-full transition ${inWishlist ? "bg-black text-white" : "bg-white/80 text-gray-500 opacity-0 group-hover:opacity-100"}`}
                      >
                        <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-white" : ""}`} />
                      </button>

                      {/* Quick add overlay */}
                      <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            requireAuth(() => {
                              if (availableStock > 0) addToCart(product);
                            });
                          }}
                          disabled={availableStock === 0}
                          className={`w-full py-3 text-sm font-semibold transition ${
                            availableStock === 0
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-black text-white hover:bg-gray-900"
                          }`}
                        >
                          {availableStock === 0 ? "Sold Out" : "Add to Cart"}
                        </button>
                      </div>
                    </div>

                    {/* Info */}
                    <div onClick={() => navigate(`/marketplace/product/${product._id}`)}>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                        {product.category?.name || "General"}
                      </p>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          Rs {Number(price).toLocaleString()}
                        </span>
                        {user?.role === "retailer" && (
                          <span className="text-xs text-gray-400">
                            · sell Rs {Number(getSuggestedPrice(product)).toLocaleString()}
                          </span>
                        )}
                      </div>
                      {availableStock > 0 && availableStock <= 10 && (
                        <p className="text-xs text-amber-600 mt-1 font-medium">Only {availableStock} left</p>
                      )}
                    </div>

                    {/* Buy Now */}
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        requireAuth(() => {
                          if (availableStock > 0) { addToCart(product); navigate("/cart"); }
                        });
                      }}
                      disabled={availableStock === 0}
                      className={`mt-3 w-full py-2.5 rounded-full text-xs font-semibold transition ${
                        availableStock === 0
                          ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {availableStock === 0 ? "Out of Stock" : "Buy Now"}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </main>

        {/* ─────────────────────── FOOTER STRIP ───────────────────────────────── */}
        <footer className="bg-[#111] mt-20 py-10 px-6 text-center">
          <p className="text-gray-600 text-sm">
            © 2025 eAson Nepal · Built for Nepali traders
          </p>
        </footer>
      </div>
    </>
  );
}