// src/pages/retailer/Marketplace.jsx
import React, { useEffect, useState, useRef } from "react";
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
  Eye,
  Minus,
  Trash2,
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("eason_wishlist")) || []; }
    catch { return []; }
  });
  const [compareList, setCompareList] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState(() => {
    try { return JSON.parse(localStorage.getItem("eason_recent")) || []; }
    catch { return []; }
  });
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [qvQty, setQvQty] = useState(1);
  const searchRef = useRef(null);

  const { cartCount, addToCart, getAvailableStock } = useCart();

  // Close search dropdown on outside click or Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") { setSearchOpen(false); setShowSuggestions(false); } };
    const onClickOut = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClickOut);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClickOut); };
  }, []);

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

  const toggleWishlist = (id) => {
    setWishlist(w => {
      const next = w.includes(id) ? w.filter(x => x !== id) : [...w, id];
      localStorage.setItem("eason_wishlist", JSON.stringify(next));
      return next;
    });
  };

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

  const handleProductClick = (product) => {
    let recent = [...recentlyViewed];
    recent = recent.filter(p => p._id !== product._id);
    recent.unshift(product);
    recent = recent.slice(0, 5);
    localStorage.setItem("eason_recent", JSON.stringify(recent));
    setRecentlyViewed(recent);
    navigate(`/marketplace/product/${product._id}`);
  };

  const toggleCompare = (e, product) => {
    e.stopPropagation();
    if (compareList.find(c => c._id === product._id)) {
      setCompareList(prev => prev.filter(c => c._id !== product._id));
    } else {
      if (compareList.length >= 3) {
        toast.error("You can compare up to 3 products");
        return;
      }
      setCompareList(prev => [...prev, product]);
    }
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
                        ref={searchRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val) setSearchParams({ q: val });
                          else setSearchParams({});
                        }}
                        onFocus={() => setShowSuggestions(true)}
                        onKeyDown={e => {
                          if (e.key === "Enter") {
                            setShowSuggestions(false);
                            setSearchOpen(false);
                          }
                        }}
                        placeholder="SEARCH..."
                        className="w-full bg-white/5 border border-white/20 text-white placeholder-gray-500 rounded-none px-4 py-2 text-xs font-bold tracking-widest uppercase focus:outline-none focus:border-white transition-colors pr-10"
                      />
                      <button onClick={() => setSearchOpen(false)} className="absolute right-3 text-white/50 hover:text-white transition">
                        <X className="w-4 h-4" />
                      </button>
                      
                      {/* Instant Results Dropdown */}
                      <AnimatePresence>
                        {showSuggestions && searchQuery.length >= 2 && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="absolute top-full mt-2 left-0 w-80 bg-[#1a1a1a] border border-white/10 shadow-2xl z-50 overflow-hidden"
                          >
                            {filteredProducts.slice(0, 5).map(p => (
                              <button
                                key={p._id}
                                onMouseDown={() => navigate(`/marketplace/product/${p._id}`)}
                                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/8 transition border-b border-white/5 last:border-0"
                              >
                                {/* Thumbnail */}
                                <div className="w-8 h-8 bg-white/10 flex items-center justify-center shrink-0 rounded">
                                  {p.image
                                    ? <img src={`http://localhost:5000${p.image}`} alt={p.name} className="w-full h-full object-contain rounded" />
                                    : <Package className="w-4 h-4 text-gray-500" />
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-white text-left truncate">{p.name}</p>
                                  <p className="text-[11px] text-gray-500">{p.category?.name || "General"}</p>
                                </div>
                                <span className="text-xs text-emerald-400 font-semibold shrink-0">
                                  Rs {Number(getDisplayPrice(p)).toLocaleString()}
                                </span>
                              </button>
                            ))}
                            {filteredProducts.length === 0 && (
                              <div className="px-4 py-3 text-gray-500 text-sm">No results for "{searchQuery}"</div>
                            )}
                            {/* Footer row */}
                            <div className="border-t border-white/10 px-4 py-2.5 text-[11px] text-gray-500">
                              Press <kbd className="bg-white/10 rounded px-1.5 py-0.5 text-white">↵ Enter</kbd> to see all results for "{searchQuery}"
                            </div>
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
              <button
                onClick={() => navigate("/wishlist")}
                className="relative p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-white/10"
              >
                <Heart className="w-5 h-5" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
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

        {/* ─────────────────────── STICKY CATEGORY STRIP ───────────────────── */}
        <section className="sticky top-[72px] z-40 bg-white/95 backdrop-blur-md border-b border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="max-w-screen-2xl mx-auto py-3 px-6 overflow-x-auto scrollbar-hide flex items-center gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2 text-sm font-semibold whitespace-nowrap transition-colors rounded-full ${
                  selectedCategory === cat
                    ? "bg-black text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        {/* ─────────────────────── MAIN CONTENT ───────────────────────────────── */}
        <main className="max-w-screen-2xl mx-auto px-6 pt-6 pb-10" id="products-grid">

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
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setSearchParams({ q: val });
                    else setSearchParams({});
                  }}
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

          {/* RECENTLY VIEWED STRIP */}
          {recentlyViewed.length > 0 && searchQuery === "" && selectedCategory === "All" && (
            <div className="mb-12">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Eye className="w-5 h-5 text-emerald-500" /> Recently Viewed
              </h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                {recentlyViewed.map((rp, i) => (
                  <div key={i} onClick={() => handleProductClick(rp)} className="w-40 shrink-0 cursor-pointer group hover:bg-gray-50 p-2 rounded-xl transition">
                    <div className="aspect-square bg-[#f5f5f5] rounded-xl overflow-hidden mb-2">
                      {rp.image ? <img src={`http://localhost:5000${rp.image}`} alt={rp.name} className="w-full h-full object-contain p-2" /> : <Package className="w-8 h-8 text-gray-300 mx-auto mt-6" />}
                    </div>
                    <p className="text-xs font-semibold text-gray-900 line-clamp-1">{rp.name}</p>
                    <p className="text-xs font-bold text-emerald-600 mt-0.5">Rs {Number(getDisplayPrice(rp)).toLocaleString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                const suggestedPrice = getSuggestedPrice(product);
                const marginPct = price > 0 ? Math.round(((suggestedPrice - price) / price) * 100) : 0;
                const isOutOfStock = availableStock === 0;
                const isUrgent = availableStock >= 1 && availableStock <= 5;
                const isLowStock = availableStock >= 6 && availableStock <= 15;
                const isHot = product.stock > 0 && product.stock <= 10;

                return (
                  <motion.div
                    key={product._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.4) }}
                    className={`group cursor-pointer relative ${
                      isOutOfStock ? "opacity-50 pointer-events-none select-none" : ""
                    }`}
                  >
                    {/* Image */}
                    <div
                      className="relative aspect-square bg-[#f5f5f5] overflow-hidden mb-4"
                      onClick={() => handleProductClick(product)}
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

                      {/* Out of Stock Overlay */}
                      {isOutOfStock && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/40">
                          <span className="bg-gray-800 text-white text-xs font-bold uppercase tracking-widest px-3 py-1">
                            Out of Stock
                          </span>
                        </div>
                      )}

                      {/* Badges top-left */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                        {isNew(product.createdAt) && (
                          <span className="bg-black text-white text-[10px] font-bold px-2.5 py-1">NEW</span>
                        )}
                        {isHot && (
                          <span className="bg-rose-500 text-white text-[10px] font-bold px-2.5 py-1">HOT</span>
                        )}
                      </div>

                      {/* Stock count badge */}
                      {product.stock > 0 && product.stock <= 5 && (
                        <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm text-red-600 text-[10px] font-bold px-2.5 py-1 border border-red-100 z-10">
                          {product.stock} LEFT
                        </div>
                      )}

                      {/* Wishlist */}
                      <button
                        onClick={e => { e.stopPropagation(); toggleWishlist(product._id); }}
                        className={`absolute top-3 right-3 p-2 transition rounded-md ${
                          inWishlist ? "bg-black text-white" : "bg-white/80 text-gray-500 opacity-0 group-hover:opacity-100"
                        }`}
                        title="Wishlist"
                      >
                        <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-white" : ""}`} />
                      </button>

                      {/* Compare toggle */}
                      <button
                        onClick={e => toggleCompare(e, product)}
                        className={`absolute top-12 right-3 p-2 transition rounded-md ${
                          compareList.find(c => c._id === product._id) ? "bg-emerald-600 text-white" : "bg-white/80 text-gray-500 opacity-0 group-hover:opacity-100"
                        }`}
                        title="Compare"
                      >
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                      </button>

                      {/* Quick View button — center on hover */}
                      {!isOutOfStock && (
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            setQvQty(1);
                            setQuickView(product);
                          }}
                          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="flex items-center gap-2 bg-white text-black text-xs font-bold uppercase tracking-widest px-4 py-2.5 shadow-lg">
                            <Eye className="w-3.5 h-3.5" /> Quick View
                          </span>
                        </button>
                      )}

                      {/* Quick add overlay */}
                      {!isOutOfStock && (
                        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <button
                            onClick={e => {
                              e.stopPropagation();
                              requireAuth(() => { addToCart(product); });
                            }}
                            className="w-full py-3 text-sm font-semibold bg-black text-white hover:bg-gray-900 transition"
                          >
                            Add to Cart
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div onClick={() => !isOutOfStock && handleProductClick(product)}>
                      <p className="text-[11px] text-gray-400 uppercase tracking-wider mb-1">
                        {product.category?.name || "General"}
                      </p>
                      <h3 className="text-sm font-medium text-gray-900 line-clamp-2 leading-snug">
                        {product.name}
                      </h3>

                      {/* Price row + margin badge */}
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">
                          Rs {Number(price).toLocaleString()}
                        </span>
                        {user?.role === "retailer" && marginPct > 0 && (
                          <span className="bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            +{marginPct}% margin
                          </span>
                        )}
                      </div>

                      {/* Suggested sell price for retailers */}
                      {user?.role === "retailer" && (
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Sell @ Rs {Number(suggestedPrice).toLocaleString()}
                        </p>
                      )}

                      {/* Stock urgency indicators */}
                      {isUrgent && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse shrink-0" />
                          <p className="text-[11px] text-red-600 font-semibold">
                            Only {availableStock} left — selling fast
                          </p>
                        </div>
                      )}
                      {isLowStock && (
                        <p className="text-[11px] text-amber-600 font-semibold mt-1.5">
                          ⚠ Low stock
                        </p>
                      )}
                    </div>

                    {/* Buy Now */}
                    {!isOutOfStock && (
                      <button
                        onClick={e => {
                          e.stopPropagation();
                          requireAuth(() => { addToCart(product); navigate("/cart"); });
                        }}
                        className="mt-3 w-full py-2.5 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                      >
                        Buy Now
                      </button>
                    )}
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

      {/* ─────────────────────── QUICK VIEW MODAL ────────────────────────────── */}
      <AnimatePresence>
        {quickView && (() => {
          const qvStock = getAvailableStock(quickView._id, quickView.stock);
          const qvPrice = getDisplayPrice(quickView);
          const qvSuggested = getSuggestedPrice(quickView);
          const qvMargin = qvPrice > 0 ? Math.round(((qvSuggested - qvPrice) / qvPrice) * 100) : 0;
          return (
            <motion.div
              key="qv-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={e => { if (e.target === e.currentTarget) setQuickView(null); }}
            >
              <motion.div
                initial={{ scale: 0.94, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.94, opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white w-full max-w-3xl overflow-hidden"
                style={FONT_STYLE}
              >
                {/* Close */}
                <button
                  onClick={() => setQuickView(null)}
                  className="absolute top-4 right-4 z-10 w-9 h-9 bg-black text-white flex items-center justify-center hover:bg-gray-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="grid md:grid-cols-2">
                  {/* Image */}
                  <div className="relative bg-[#f5f5f5] aspect-square md:aspect-auto flex items-center justify-center p-8">
                    {quickView.image
                      ? <img src={`http://localhost:5000${quickView.image}`} alt={quickView.name} className="w-full h-full object-contain" />
                      : <Package className="w-16 h-16 text-gray-300" />
                    }
                    {isNew(quickView.createdAt) && (
                      <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-2.5 py-1">NEW</span>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-8 flex flex-col gap-5 overflow-y-auto max-h-[80vh]">
                    <div>
                      <p className="text-[11px] text-gray-400 uppercase tracking-widest font-bold mb-1">
                        {quickView.category?.name || "General"}
                      </p>
                      <h2 className="text-2xl font-bold tracking-tight text-black">{quickView.name}</h2>
                    </div>

                    {/* Price */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-3xl font-bold text-black">Rs {Number(qvPrice).toLocaleString()}</span>
                      {user?.role === "retailer" && qvMargin > 0 && (
                        <span className="bg-emerald-600 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">+{qvMargin}% margin</span>
                      )}
                    </div>
                    {user?.role === "retailer" && (
                      <p className="text-sm text-gray-400 -mt-3">Sell @ Rs {Number(qvSuggested).toLocaleString()}</p>
                    )}

                    {/* Stock status */}
                    <div className="flex items-center gap-2">
                      {qvStock === 0 ? (
                        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Out of Stock</span>
                      ) : qvStock <= 5 ? (
                        <div className="flex items-center gap-1.5">
                          <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                          <span className="text-xs font-semibold text-red-600">Only {qvStock} left — selling fast</span>
                        </div>
                      ) : qvStock <= 15 ? (
                        <span className="text-xs font-semibold text-amber-600">⚠ Low stock ({qvStock} units)</span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-600">✓ In Stock</span>
                      )}
                    </div>

                    {/* Description */}
                    {quickView.description && (
                      <p className="text-sm text-gray-500 leading-relaxed border-t border-gray-100 pt-4">
                        {quickView.description}
                      </p>
                    )}

                    {/* Quantity selector */}
                    {qvStock > 0 && (
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Qty</span>
                        <div className="flex items-center border border-gray-200">
                          <button
                            onClick={() => setQvQty(q => Math.max(1, q - 1))}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-12 text-center text-sm font-bold">{qvQty}</span>
                          <button
                            onClick={() => setQvQty(q => Math.min(qvStock, q + 1))}
                            className="w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Buttons */}
                    <div className="flex flex-col gap-3 mt-2">
                      <button
                        onClick={() => {
                          requireAuth(() => {
                            for (let i = 0; i < qvQty; i++) addToCart(quickView);
                            setQuickView(null);
                          });
                        }}
                        disabled={qvStock === 0}
                        className="w-full py-4 bg-white border-2 border-black text-black text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>
                      <button
                        onClick={() => {
                          requireAuth(() => {
                            for (let i = 0; i < qvQty; i++) addToCart(quickView);
                            setQuickView(null);
                            navigate("/cart");
                          });
                        }}
                        disabled={qvStock === 0}
                        className="w-full py-4 bg-emerald-600 text-white text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Buy Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      {/* COMPARE BAR & MODAL */}
      <AnimatePresence>
        {compareList.length > 0 && !showCompareModal && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50 p-4"
          >
            <div className="max-w-screen-xl mx-auto flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="font-bold text-gray-900 border-r border-gray-200 pr-4">Compare Products</span>
                <div className="flex gap-2">
                  {compareList.map(c => (
                    <div key={c._id} className="w-12 h-12 bg-gray-50 rounded border border-gray-200 p-1 relative group">
                      <button onClick={() => setCompareList(prev => prev.filter(x => x._id !== c._id))} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition shadow">
                        <X className="w-3 h-3" />
                      </button>
                      {c.image ? <img src={`http://localhost:5000${c.image}`} className="w-full h-full object-contain" /> : <Package className="w-full h-full text-gray-300" />}
                    </div>
                  ))}
                  {Array.from({ length: Math.max(0, 3 - compareList.length) }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-12 h-12 border-2 border-dashed border-gray-200 rounded flex items-center justify-center text-gray-300">
                      <Plus className="w-4 h-4" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setCompareList([])} className="text-sm font-semibold text-gray-500 hover:text-black">Clear All</button>
                <button 
                  onClick={() => setShowCompareModal(true)} 
                  disabled={compareList.length < 2}
                  className="px-6 py-3 bg-black text-white font-bold rounded hover:bg-gray-800 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                >
                  Compare ({compareList.length})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCompareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-auto relative p-8 shadow-2xl"
            >
              <button onClick={() => setShowCompareModal(false)} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition">
                <X className="w-5 h-5 text-black" />
              </button>
              <h2 className="text-2xl font-black text-black uppercase mb-8 tracking-wide">Product Comparison</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr>
                      <th className="w-48 p-4 font-semibold text-gray-500 border-b border-gray-200">Features</th>
                      {compareList.map(c => (
                        <th key={c._id} className="p-4 border-b border-gray-200 relative align-top">
                          <button onClick={() => {
                            setCompareList(prev => prev.filter(x => x._id !== c._id));
                            if (compareList.length <= 2) setShowCompareModal(false);
                          }} className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 transition">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="h-32 mb-4 bg-gray-50 flex items-center justify-center overflow-hidden rounded">
                            {c.image ? <img src={`http://localhost:5000${c.image}`} className="h-full object-contain p-2" /> : <Package className="w-10 h-10 text-gray-300" />}
                          </div>
                          <h3 className="font-bold text-black text-lg truncate" title={c.name}>{c.name}</h3>
                          <p className="text-emerald-600 font-bold mt-1 tracking-wide">Rs {Number(getDisplayPrice(c)).toLocaleString()}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    <tr>
                      <td className="p-4 font-semibold text-sm text-gray-600">Category</td>
                      {compareList.map(c => <td key={c._id} className="p-4 text-sm font-medium">{c.category?.name || "-"}</td>)}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-sm text-gray-600">Availability</td>
                      {compareList.map(c => <td key={c._id} className="p-4 text-sm font-medium">
                        {c.stock > 10 ? <span className="text-emerald-600">In Stock ({c.stock})</span> : c.stock > 0 ? <span className="text-amber-600">Low Stock ({c.stock})</span> : <span className="text-red-600">Out of Stock</span>}
                      </td>)}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-sm text-gray-600 align-top">Description</td>
                      {compareList.map(c => <td key={c._id} className="p-4 text-xs leading-relaxed text-gray-500 whitespace-pre-wrap">{c.description || "-"}</td>)}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-sm text-gray-600">Action</td>
                      {compareList.map(c => <td key={c._id} className="p-4">
                        <button 
                          onClick={() => { requireAuth(() => { addToCart(c); }); toast.success("Added to cart"); }}
                          disabled={c.stock === 0}
                          className="w-full py-2 bg-black text-white font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition disabled:opacity-50"
                        >
                          Add to Cart
                        </button>
                      </td>)}
                    </tr>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}