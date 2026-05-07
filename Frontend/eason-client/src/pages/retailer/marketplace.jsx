import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2";
import {
  Heart,
  Package,
  ShoppingBag,
  LogOut,
  Plus,
  ChevronDown,
  X,
  User,
  Minus,
  Trash2,
  CheckCircle2,
  Bell,
  Github,
  Linkedin,
  Mail,
  Search,
  ChevronRight
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import API from "../../utils/api";
import { useCart } from "../../context/CartContext.jsx";
import { useAuthStore } from "../../store/authStore.js";
import toast from "react-hot-toast";

const FONT_URL = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap";
const FONT_STYLE = { fontFamily: "'DM Sans', sans-serif", letterSpacing: "-0.01em" };

const FEATURE_CATEGORIES = [
  { label: "Electronics Accessories", color: "#3b82f6" },
  { label: "Clothing & Apparel", color: "#8b5cf6" },
  { label: "Beauty & Cosmetics", color: "#ec4899" },
  { label: "Home & Living", color: "#f59e0b" },
];

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) return;
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => document.removeEventListener("mousedown", listener);
  }, [ref, handler]);
}

function AnimatedFeaturedSection({ products, navigate }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isHovered) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % FEATURE_CATEGORIES.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [isHovered]);

  const activeCategory = FEATURE_CATEGORIES[activeIndex];
  const matchingProducts = products.filter(p => {
    const catName = p.category?.name?.toLowerCase() || "";
    const label = activeCategory.label.toLowerCase();
    // Match if product category is contained in the label OR label is contained in category
    return label.includes(catName) || catName.includes(label.split(" ")[0]);
  }).slice(0, 4);
  const displayProducts = [...matchingProducts];
  while (displayProducts.length < 4) {
    displayProducts.push(null);
  }

  // Reorder for masonry layout: 0 (odd tall), 1&3 (even stack), 2 (odd tall)
  const col1 = displayProducts[0];
  const col2Top = displayProducts[1];
  const col2Bot = displayProducts[3];
  const col3 = displayProducts[2];

  const renderProductImage = null; // Unused now

  return (
    <section className="bg-white pt-6 pb-16 px-8 lg:px-16 flex flex-col lg:flex-row border-b border-gray-100 overflow-hidden">
      <div className="w-full lg:w-[38%] mb-10 lg:mb-0">
        <div className="flex flex-col gap-2" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
          {FEATURE_CATEGORIES.map((cat, i) => {
            const isActive = i === activeIndex;
            return (
              <div
                key={cat.label}
                onClick={() => { setActiveIndex(i); setIsHovered(true); }}
                className={`flex items-center gap-4 py-3 px-4 cursor-pointer rounded-xl transition group ${isActive ? "bg-gray-50" : ""}`}
              >
                <div className="w-1 h-6 rounded-full transition-colors relative overflow-hidden bg-gray-200">
                  <AnimatePresence>
                    {isActive && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "100%" }}
                        exit={{ height: 0 }}
                        className="absolute bottom-0 w-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    )}
                  </AnimatePresence>
                </div>
                <span className={`text-sm font-medium transition ${isActive ? "text-gray-900" : "text-gray-400 group-hover:text-gray-900"}`}>
                  {cat.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="w-full lg:w-[62%] lg:pl-16 flex flex-col overflow-hidden" onMouseEnter={() => setIsHovered(true)} onMouseLeave={() => setIsHovered(false)}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35 }}
            className="grid grid-cols-3 gap-6 max-h-[380px] overflow-hidden"
          >
            {displayProducts.slice(0, 3).map((prod, idx) => (
              prod ? (
                <div 
                  key={prod._id || idx}
                  className="flex flex-col cursor-pointer group"
                  onClick={() => navigate(`/marketplace/product/${prod._id}`)}
                >
                  <div className="w-full h-[220px] rounded-[12px] overflow-hidden bg-[#f5f5f5] mb-3">
                    {prod.image ? (
                      <img src={`http://localhost:5000${prod.image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={prod.name} />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><Package className="w-10 h-10 text-gray-300" /></div>
                    )}
                  </div>
                  <h3 className="text-gray-900 font-bold text-[13px] line-clamp-1 leading-tight">{prod.name}</h3>
                  <p className="text-gray-600 font-medium text-[12px] mt-1">Rs {Number(prod.priceInfo?.finalPrice || prod.wholesalerPrice || prod.price || 0).toLocaleString()}</p>
                </div>
              ) : (
                <div key={idx} className="flex flex-col">
                  <div className="w-full h-[220px] rounded-[12px] bg-[#f5f5f5] mb-3 flex items-center justify-center">
                    <Package className="w-10 h-10 text-gray-300" />
                  </div>
                </div>
              )
            ))}
          </motion.div>
        </AnimatePresence>

        <div className="flex items-center justify-center gap-1.5 mt-4">
          {FEATURE_CATEGORIES.map((cat, i) => (
            <div
              key={i}
              className={`transition-all duration-300 rounded-full ${i === activeIndex ? "w-6 h-1.5" : "w-1.5 h-1.5 bg-gray-200"}`}
              style={i === activeIndex ? { backgroundColor: cat.color } : {}}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default function Marketplace() {
  const navigate = useNavigate();
  const { user, logout, loading: authLoading } = useAuthStore();

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchParams, setSearchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("Newest");
  const [loading, setLoading] = useState(true);

  const [wishlist, setWishlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem("eason_wishlist")) || []; }
    catch { return []; }
  });
  const [compareList, setCompareList] = useState([]);

  const [showCompareModal, setShowCompareModal] = useState(false);
  const [quickView, setQuickView] = useState(null);
  const [qvQty, setQvQty] = useState(1);
  const [recommendedProducts, setRecommendedProducts] = useState([]);

  // Filter dropdown states
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
  const sortRef = useRef(null);
  useOutsideClick(sortRef, () => setSortDropdownOpen(false));

  const [marginDropdownOpen, setMarginDropdownOpen] = useState(false);
  const marginRef = useRef(null);
  useOutsideClick(marginRef, () => setMarginDropdownOpen(false));

  const { cartCount, addToCart, getAvailableStock } = useCart();

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

  // Use the same endpoint just for general ML recommended data if we don't have recently viewed
  useEffect(() => {
    const fetchRecs = async () => {
      if (!products[0]?._id) return;
      try {
        const res = await API.get(`/products/${products[0]._id}/recommendations`);
        setRecommendedProducts(res.data || []);
      } catch {
        setRecommendedProducts([]);
      }
    };
    if (products.length > 0 && recommendedProducts.length === 0) fetchRecs();
  }, [products]);

  useEffect(() => {
    let f = [...products];
    if (searchQuery) f = f.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    if (selectedCategory !== "All") f = f.filter(p => p.category?.name === selectedCategory);

    if (sortBy === "Newest First" || sortBy === "Newest") f.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    else if (sortBy === "Price: Low to High") f.sort((a, b) => getDisplayPrice(a) - getDisplayPrice(b));
    else if (sortBy === "Price: High to Low") f.sort((a, b) => getDisplayPrice(b) - getDisplayPrice(a));
    else if (sortBy === "Highest Margin") f.sort((a, b) => ((getSuggestedPrice(b) - getDisplayPrice(b)) / getDisplayPrice(b)) - ((getSuggestedPrice(a) - getDisplayPrice(a)) / getDisplayPrice(a)));
    else if (sortBy === "Lowest Margin") f.sort((a, b) => ((getSuggestedPrice(a) - getDisplayPrice(a)) / getDisplayPrice(a)) - ((getSuggestedPrice(b) - getDisplayPrice(b)) / getDisplayPrice(b)));

    setFilteredProducts(f);
  }, [searchQuery, selectedCategory, sortBy, products]);

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
        popup: "!rounded-none !border !border-gray-200 !shadow-2xl !p-8 !font-sans",
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
          popup: "!rounded-none !border !border-gray-200 !shadow-2xl !p-8 !font-sans",
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
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center" style={FONT_STYLE}>
        <link href={FONT_URL} rel="stylesheet" />
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-2 border-white/10 border-t-emerald-500 rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const visibleCategories = categories.slice(0, 7);
  const hiddenCategories = categories.slice(7);

  return (
    <>
      <link href={FONT_URL} rel="stylesheet" />
      <div className="min-h-screen bg-[#0a0a0a]" style={FONT_STYLE}>

        <div className="relative z-50">
          {/* Top utility bar */}
          {user && (
            <div className="bg-[#0a0a0a] border-b border-white/5 px-6 py-2 flex items-center justify-end gap-4 text-[11px] font-medium text-white/50 max-w-screen-2xl mx-auto uppercase tracking-wider">
              <span>Welcome, {user.firstName}</span>
              {user.role === "wholesaler" && user.verified && (
                <button onClick={() => navigate("/add-product")} className="flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition">
                  <Plus className="w-3 h-3" /> Add Product
                </button>
              )}
              {user.role === "admin" && (
                <button onClick={() => navigate("/dashboard")} className="text-white/80 hover:text-white transition">
                  Admin Panel
                </button>
              )}
              <button onClick={handleLogout} className="flex items-center gap-1 hover:text-white transition">
                <LogOut className="w-3 h-3" /> Sign out
              </button>
            </div>
          )}

          {/* Zone A */}
          <div className="bg-[#111111] px-8 py-4 flex items-center justify-between relative">
            {/* Left */}
            <div className="flex-1">
              <button onClick={() => navigate("/marketplace")} className="text-xl font-bold tracking-tight text-white flex items-center">
                eAson<span className="text-emerald-500">.</span>
              </button>
            </div>

            {/* Center */}
            <div className="flex-1 flex justify-center absolute left-1/2 -translate-x-1/2">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setSearchParams({ q: val });
                    else setSearchParams({});
                  }}
                  placeholder="Search products, suppliers, categories..."
                  className="w-[360px] bg-transparent border border-white/12 rounded-lg pl-4 pr-10 py-2 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 transition-colors shadow-[inset_0_1px_2px_rgba(0,0,0,0.3)]"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
              </div>
            </div>

            {/* Right */}
            <div className="flex-1 flex justify-end items-center gap-6">
              <button onClick={() => navigate("/wishlist")} className="relative text-white/50 hover:text-white transition">
                <Heart className="w-[22px] h-[22px]" />
                {wishlist.length > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-rose-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">{wishlist.length}</span>
                )}
              </button>
              {user?.role === "retailer" && (
                <button onClick={() => navigate("/profile")} className="text-white/50 hover:text-white transition">
                  <Package className="w-[22px] h-[22px]" />
                </button>
              )}
              <button onClick={() => navigate("/cart")} className="relative text-white/50 hover:text-white transition">
                <ShoppingBag className="w-[22px] h-[22px]" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 bg-emerald-500 rounded-full text-[9px] font-bold flex items-center justify-center text-white">{cartCount}</span>
                )}
              </button>
              <button className="text-white/50 hover:text-white transition">
                <Bell className="w-[22px] h-[22px]" />
              </button>
              <div className="w-px h-5 bg-white/10" />
              <button onClick={() => navigate(user ? "/profile" : "/login")} className="text-white/50 hover:text-white transition pl-1">
                {user ? (
                  <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    {user.firstName?.[0]?.toUpperCase() || "U"}
                  </div>
                ) : (
                  <User className="w-[22px] h-[22px]" />
                )}
              </button>
            </div>
          </div>

          {/* Zone B */}
          <div className="bg-[#111111] border-y border-white/5 px-8 py-0 flex items-stretch gap-0 overflow-x-auto scrollbar-hide">
            {visibleCategories.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <div
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`relative px-5 py-3.5 text-[13px] font-medium transition-colors cursor-pointer whitespace-nowrap ${isActive ? "text-white" : "text-white/45 hover:text-white"}`}
                >
                  {cat}
                  {isActive && <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-emerald-500" />}
                </div>
              );
            })}
            {hiddenCategories.length > 0 && (
              <div className="relative group px-5 py-3.5 text-[13px] font-medium text-white/45 hover:text-white transition-colors cursor-pointer whitespace-nowrap">
                More ▾
                <div className="hidden group-hover:block absolute top-full right-0 bg-[#1a1a1a] border border-white/8 rounded-lg mt-1 py-2 shadow-xl z-50 min-w-[160px]">
                  {hiddenCategories.map(cat => (
                    <div
                      key={cat}
                      onClick={(e) => { e.stopPropagation(); setSelectedCategory(cat); }}
                      className="block px-4 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 transition"
                    >
                      {cat}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ─────────────────────── PART 2: HERO SECTION ─────────────────────── */}
        <section className="min-h-[90vh] bg-[#080808] flex flex-col relative overflow-hidden">
          {/* Overlays */}
          <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='1.2' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")` }} />
          <div className="absolute top-[-30%] right-[-20%] w-[600px] h-[600px] bg-emerald-500 rounded-full blur-[200px] opacity-[0.04] pointer-events-none" />

          {/* TOP ROW */}
          <div className="flex items-center justify-between px-12 lg:px-20 pt-12 pb-0 relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 border border-white/8 rounded-full px-3 py-1 text-[11px] text-white/40 font-medium">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live Market
              </div>
              <div className="flex items-center gap-2 border border-white/8 rounded-full px-3 py-1 text-[11px] text-white/40 font-medium">
                🇳🇵 Nepal
              </div>
              <div className="flex items-center gap-2 border border-white/8 rounded-full px-3 py-1 text-[11px] text-white/40 font-medium">
                {products.length} SKUs
              </div>
            </div>
            <div className="text-[11px] text-white/25 uppercase tracking-[0.14em] font-medium hidden md:block">
              {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>

          {/* MIDDLE ROW */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }} className="flex-1 flex items-center relative px-12 lg:px-20 py-8">
            <div className="w-full relative z-10">
              <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}>
                <h1 
                  className="text-[clamp(4rem,8vw,7.5rem)] font-medium text-white leading-[0.95]"
                  style={{ letterSpacing: '-0.05em' }}
                >
                  <span className="block">Source.</span>
                  <span className="block pl-[0.4em] text-white/20">Verify.</span>
                  <span className="block">Trade.</span>
                </h1>
                <p className="mt-8 max-w-[420px] text-[15px] text-white/38 leading-[1.75] font-light">
                  Factory-direct pricing from verified Nepali suppliers. Real inventory. Real margins. No middlemen.
                </p>
              </motion.div>
            </div>

            <div className="absolute right-0 top-0 bottom-0 w-[50%] hidden lg:flex items-center justify-center z-20">
              <div className="relative w-[500px] h-[460px]">
                <motion.div 
                  initial={{ opacity: 0, y: -16 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.5, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-0 right-0 w-[220px] h-[160px] overflow-hidden rounded-2xl shadow-2xl border border-white/8"
                >
                  <img src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=400&q=80" alt="Apparel" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[9px] uppercase tracking-widest font-bold text-white">Apparel</span>
                </motion.div>

                <div className="absolute w-px bg-white/10 h-[80px] top-[160px] right-[110px]" />

                <motion.div 
                  initial={{ opacity: 0, y: -16 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.7, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute top-[180px] right-[160px] w-[180px] h-[200px] overflow-hidden rounded-2xl shadow-2xl border border-white/8"
                >
                  <img src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=400&q=80" alt="Beauty" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[9px] uppercase tracking-widest font-bold text-white">Beauty</span>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: -16 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 0.9, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-0 right-0 w-[200px] h-[150px] overflow-hidden rounded-2xl shadow-2xl border border-white/8"
                >
                  <img src="https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=400&q=80" alt="Electronics" className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute bottom-2.5 left-3 text-[9px] uppercase tracking-widest font-bold text-white">Electronics</span>
                </motion.div>

                <motion.div 
                  initial={{ opacity: 0, y: -16 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  transition={{ delay: 1.1, duration: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="absolute bottom-10 right-[240px] w-[140px] bg-[#0f0f0f] border border-white/8 rounded-2xl p-4 flex flex-col gap-1 shadow-2xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[9px] uppercase tracking-widest text-white/40 font-semibold">Live</span>
                  </div>
                  <span className="text-3xl font-semibold text-white">{products.length || "..."}</span>
                  <span className="text-[10px] text-white/30 mt-0.5">SKUs available</span>
                  <div className="w-6 h-px bg-white/8 my-2" />
                  <span className="text-[10px] text-emerald-400 font-medium">Real-time</span>
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* BOTTOM ROW */}
          <div className="border-t border-white/6 px-12 lg:px-20 py-8 flex flex-col md:flex-row items-start md:items-center gap-8 relative z-10 bg-[#080808]">
            <div className="flex flex-wrap items-center gap-4">
              <button
                onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                className="bg-white text-[#080808] text-sm font-semibold px-8 py-3.5 rounded-sm hover:bg-white/92 transition-colors"
              >
                Start sourcing
              </button>
              <button
                onClick={() => document.getElementById("products-grid")?.scrollIntoView({ behavior: "smooth" })}
                className="text-sm text-white/40 hover:text-white transition-colors flex items-center gap-2"
              >
                Browse catalog →
              </button>
            </div>

            <div className="hidden md:block w-px h-8 bg-white/8" />

            <div className="flex flex-wrap items-center gap-10 md:ml-auto">
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-semibold text-white" style={{ letterSpacing: "-0.03em" }}>142</span>
                <span className="text-[10px] text-white/28 uppercase tracking-widest font-medium">Suppliers</span>
              </div>
              <div className="w-px h-8 bg-white/6" />
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-semibold text-white" style={{ letterSpacing: "-0.03em" }}>4,800+</span>
                <span className="text-[10px] text-white/28 uppercase tracking-widest font-medium">Products</span>
              </div>
              <div className="w-px h-8 bg-white/6" />
              <div className="flex flex-col gap-1">
                <span className="text-2xl font-semibold text-white" style={{ letterSpacing: "-0.03em" }}>12.5k</span>
                <span className="text-[10px] text-white/28 uppercase tracking-widest font-medium">Orders</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─────────────────────── PART 4: ANIMATED CATEGORIES ──────────────────── */}
        <div className="bg-white pt-14 px-8 lg:px-16 pb-0">
          <div className="flex items-baseline gap-3 mb-0">
            <span className="text-[11px] uppercase tracking-widest text-gray-400 font-medium">Explore</span>
            <span className="text-3xl font-bold text-gray-900 tracking-tight">Categories</span>
          </div>
        </div>
        <AnimatedFeaturedSection products={products} navigate={navigate} />

        {/* ─────────────────────── PART 5: PRODUCT GRID SECTION ─────────────────── */}
        <section id="products-grid" className="bg-white pt-16 px-8 lg:px-16 pb-24">
          <div className="flex flex-col gap-1 mb-2">
            <span className="text-[13px] font-semibold text-gray-400">eAson.</span>
            <span className="text-4xl font-bold text-gray-900 tracking-tight">{selectedCategory === "All" ? "New" : selectedCategory}</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 mb-10 pb-4 border-b border-gray-100">
            {/* Left side: Filters & Sort */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm">
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><line x1="2" y1="4" x2="14" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="2" y1="8" x2="14" y2="8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><line x1="2" y1="12" x2="14" y2="12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /><circle cx="5" cy="4" r="1.5" fill="white" stroke="currentColor" strokeWidth="1.5" /><circle cx="10" cy="8" r="1.5" fill="white" stroke="currentColor" strokeWidth="1.5" /><circle cx="7" cy="12" r="1.5" fill="white" stroke="currentColor" strokeWidth="1.5" /></svg>
                Show filters
              </button>
              
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                >
                  Values <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>
                {sortDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-20">
                    {["Newest First", "Price: Low to High", "Price: High to Low"].map(opt => (
                      <div
                        key={opt}
                        onClick={() => { setSortBy(opt); setSortDropdownOpen(false); }}
                        className={`px-4 py-2.5 rounded-xl text-[13px] cursor-pointer hover:bg-gray-50 ${sortBy === opt ? "text-gray-900 font-semibold" : "text-gray-700"}`}
                      >
                        {sortBy === opt && "✓ "} {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {user?.role === "retailer" && (
                <div className="relative" ref={marginRef}>
                  <button
                    onClick={() => setMarginDropdownOpen(!marginDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-gray-200 text-[13px] font-semibold text-gray-700 bg-white hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
                  >
                    Margin <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                  </button>
                  {marginDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-100 rounded-2xl shadow-lg p-2 z-20">
                      {["Highest Margin", "Lowest Margin"].map(opt => (
                        <div
                          key={opt}
                          onClick={() => { setSortBy(opt); setMarginDropdownOpen(false); }}
                          className={`px-4 py-2.5 rounded-xl text-[13px] cursor-pointer hover:bg-gray-50 ${sortBy === opt ? "text-gray-900 font-semibold" : "text-gray-700"}`}
                        >
                          {sortBy === opt && "✓ "} {opt}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right side: Search & Count */}
            <div className="flex items-center gap-4 w-full sm:w-auto mt-4 sm:mt-0">
              <div className="relative w-full sm:w-[280px]">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) setSearchParams({ q: val });
                    else setSearchParams({});
                  }}
                  placeholder="Search products..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-[13px] text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black focus:border-black transition-all"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
              <span className="text-[13px] text-gray-400 font-medium whitespace-nowrap">{filteredProducts.length} items</span>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="py-32 flex flex-col items-center justify-center text-center">
              <Package className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No products found</h3>
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
              {/* Promo Card - Spans 2 columns, height 440px */}
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); window.scrollTo(0,0); }}
                className="col-span-1 md:col-span-2 rounded-[12px] overflow-hidden flex flex-col h-[440px] relative group bg-black"
              >
                <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80" alt="Hero Featured" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors duration-300 pointer-events-none" />
                <div className="relative mt-auto p-6 z-10 flex flex-col">
                  <h2 className="text-white font-bold text-[16px] leading-tight mb-1">Premium Collection</h2>
                  <p className="text-white/80 font-medium text-[12px] uppercase tracking-wider mb-2">Selected Brands</p>
                  <span className="text-white font-bold text-[14px]">Discover New Arrivals →</span>
                </div>
              </a>

              {/* Brand Cards */}
              {filteredProducts.filter(p => p.image || (searchQuery && searchQuery.trim() !== "")).map((p, i) => {
                const inWishlist = wishlist.includes(p._id);
                const price = p.priceInfo?.finalPrice || p.wholesalerPrice || p.price || 0;
                
                return (
                  <div
                    key={p._id}
                    onClick={() => handleProductClick(p)}
                    className="bg-white border border-[#f0f0f0] rounded-[12px] flex flex-col h-[440px] cursor-pointer group hover:border-[#d0d0d0] hover:-translate-y-[2px] hover:shadow-[0_4px_20px_rgba(0,0,0,0.06)] transition-all duration-200"
                  >
                    {/* Image Area - fixed 200px */}
                    <div className="h-[200px] w-full relative bg-[#f5f5f5] rounded-t-[12px] overflow-hidden shrink-0">
                      {p.image ? (
                        <img src={`http://localhost:5000${p.image}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><Package className="w-12 h-12 text-gray-300" /></div>
                      )}
                      
                      <button
                        onClick={(e) => { e.stopPropagation(); toggleWishlist(p._id); }}
                        className="absolute top-3 right-3 w-[30px] h-[30px] bg-white rounded-full flex items-center justify-center z-10 hover:scale-110 transition-transform"
                      >
                        <Heart className={`w-3.5 h-3.5 ${inWishlist ? "fill-rose-500 text-rose-500" : "text-gray-500 hover:text-gray-900"}`} />
                      </button>
                    </div>

                    {/* Content Area - 14px 16px */}
                    <div className="p-[14px_16px] flex flex-col flex-1">
                      {/* Row 1 */}
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="font-bold text-[13px] text-gray-900 truncate">{p.wholesaler?.businessName || p.name}</span>
                        {p.wholesaler?.verified && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />}
                      </div>

                      {/* Row 2 */}
                      <p className="text-[12px] text-[#666] line-clamp-1 mb-3">{p.name}</p>

                      {/* Row 3 */}
                      <div className="flex items-center justify-between mb-3 mt-auto">
                        <span className="font-bold text-[14px] text-gray-900">Rs {Number(price).toLocaleString()}</span>
                        <span className="bg-[#f4f4f4] rounded-[20px] text-[10px] text-[#888] font-medium px-[9px] py-[3px]">
                          {p.category?.name || "General"}
                        </span>
                      </div>

                      {/* Row 4 */}
                      <div className="text-[11px] font-medium flex items-center mb-3 hover:underline w-max">
                        {(() => {
                          if (p.stock === 0) return <span className="text-red-500 flex items-center">Out of Stock!</span>;
                          if (p.stock > 0 && p.stock <= 10) return <span className="text-amber-600 flex items-center">Only {p.stock} left! <ChevronRight className="w-3 h-3 ml-0.5" /></span>;
                          if (isNew(p.createdAt)) return <span className="text-[#2563eb] flex items-center">New items ✨ <ChevronRight className="w-3 h-3 ml-0.5" /></span>;
                          if (p.stock < 50) return <span className="text-rose-500 flex items-center">Hot items 🔥 <ChevronRight className="w-3 h-3 ml-0.5" /></span>;
                          return <span className="text-gray-500 flex items-center">Available now <ChevronRight className="w-3 h-3 ml-0.5" /></span>;
                        })()}
                      </div>
                    </div>

                    {/* Bottom Divider & Footer */}
                    <div className="border-t border-[#f0f0f0]" />
                    <div className="px-4 py-3 flex items-center justify-between mt-auto">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-700 shrink-0">
                          {p.wholesaler?.businessName?.[0] || "W"}
                        </div>
                        <span className="text-[11px] text-[#999] truncate max-w-[80px]">{p.wholesaler?.businessName || "Verified Seller"}</span>
                      </div>
                      <button className="border border-[#e0e0e0] rounded-[4px] px-[10px] py-[4px] text-[10px] text-[#333] hover:bg-gray-50 transition-colors whitespace-nowrap">
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* ─────────────────────── PART 7: FOOTER ─────────────────────── */}
        <footer className="bg-[#0a0a0a] border-t border-white/5 mt-24">
          <div className="max-w-screen-xl mx-auto px-8 py-16 grid grid-cols-1 md:grid-cols-12 gap-12">
            <div className="md:col-span-4">
              <div className="text-lg font-bold text-white tracking-tight">eAson.</div>
              <p className="text-sm text-white/35 leading-relaxed mt-3 max-w-[220px]">
                The infrastructure for modern wholesale trade in Nepal.
              </p>
              <div className="flex gap-4 mt-6">
                <Github className="w-4 h-4 text-white/25 hover:text-white transition cursor-pointer" />
                <Linkedin className="w-4 h-4 text-white/25 hover:text-white transition cursor-pointer" />
                <Mail className="w-4 h-4 text-white/25 hover:text-white transition cursor-pointer" />
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-5">Marketplace</h4>
              <div className="flex flex-col gap-3">
                {["Marketplace", "New Arrivals", "Bulk Orders", "Verified Suppliers"].map(l => (
                  <span key={l} className="text-sm text-white/45 hover:text-white transition cursor-pointer">{l}</span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-5">For Suppliers</h4>
              <div className="flex flex-col gap-3">
                {["Become a Partner", "List Products", "Dashboard", "Get Verified"].map(l => (
                  <span key={l} className="text-sm text-white/45 hover:text-white transition cursor-pointer">{l}</span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-5">Support</h4>
              <div className="flex flex-col gap-3">
                {["Help Center", "Contact", "Returns", "Terms"].map(l => (
                  <span key={l} className="text-sm text-white/45 hover:text-white transition cursor-pointer">{l}</span>
                ))}
              </div>
            </div>
            <div className="md:col-span-2">
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white/25 mb-5">Nepal</h4>
              <div className="bg-white/5 border border-white/8 rounded-2xl p-4">
                <span className="text-sm font-semibold text-white">🇳🇵 Built for Nepal</span>
                <p className="text-[11px] text-white/35 mt-1 leading-snug">Supporting local trade across Kathmandu, Lalitpur & beyond.</p>
                <p className="text-[10px] text-emerald-400 font-medium mt-3">142 verified suppliers</p>
              </div>
            </div>
          </div>
          <div className="border-t border-white/5 pt-6 pb-8 px-8 flex items-center justify-between max-w-screen-xl mx-auto">
            <span className="text-[11px] text-white/20">© 2025 eAson Nepal</span>
            <div className="flex gap-6">
              {["Privacy", "Terms", "Cookies"].map(l => (
                <span key={l} className="text-[11px] text-white/20 hover:text-white/50 transition cursor-pointer">{l}</span>
              ))}
            </div>
          </div>
        </footer>

      </div>

      {/* ─────────────────────── PART 8: PRESERVE MODALS ─────────────────────── */}
      <AnimatePresence>
        {quickView && (() => {
          const qvStock = getAvailableStock(quickView._id, quickView.stock);
          const qvPrice = getDisplayPrice(quickView);
          const isQvOutOfStock = qvStock === 0;

          return (
            <motion.div
              key="qv-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
              onClick={e => { if (e.target === e.currentTarget) setQuickView(null); }}
            >
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
                className="bg-white w-full max-w-4xl overflow-hidden rounded-2xl relative shadow-2xl flex flex-col md:flex-row"
                style={FONT_STYLE}
              >
                <button
                  onClick={() => setQuickView(null)}
                  className="absolute top-4 right-4 z-20 w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg hover:bg-gray-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="w-full md:w-1/2 bg-[#f5f5f5] relative flex items-center justify-center p-8 aspect-square md:aspect-auto">
                  {quickView.image ? (
                    <img src={`http://localhost:5000${quickView.image}`} alt={quickView.name} className="w-full h-full object-contain" />
                  ) : (
                    <Package className="w-16 h-16 text-gray-300" />
                  )}
                  {isNew(quickView.createdAt) && (
                    <span className="absolute top-4 left-4 bg-black text-white text-[10px] font-bold px-2.5 py-1 rounded-sm">NEW</span>
                  )}
                </div>

                <div className="w-full md:w-1/2 p-8 flex flex-col max-h-[80vh] overflow-y-auto">
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-2">
                    {quickView.category?.name || "General"}
                  </p>
                  <h2 className="text-2xl font-bold tracking-tight text-gray-900 leading-tight mb-4">{quickView.name}</h2>

                  <div className="text-3xl font-bold text-gray-900 mb-6">
                    Rs {Number(qvPrice).toLocaleString()}
                  </div>

                  {quickView.wholesalerPrice && (
                    <div className="border border-gray-100 rounded-xl overflow-hidden mb-6">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-left">
                          <tr><th className="px-4 py-2 font-semibold text-gray-600">Units</th><th className="px-4 py-2 font-semibold text-gray-600 text-right">Price</th></tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          <tr>
                            <td className="px-4 py-2 text-gray-900">1+</td>
                            <td className="px-4 py-2 font-medium text-right text-gray-900">Rs {Number(quickView.wholesalerPrice).toLocaleString()}</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-2 text-gray-900">10+</td>
                            <td className="px-4 py-2 font-medium text-right text-emerald-600">Rs {Number(quickView.wholesalerPrice * 0.95).toLocaleString()}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="flex gap-4 mb-6 pb-6 border-b border-gray-100 text-sm">
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Lead Time</p>
                      <p className="font-medium text-gray-900">{quickView.leadTime || "3-5 days"}</p>
                    </div>
                    <div className="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Min Order</p>
                      <p className="font-medium text-gray-900">{quickView.moq || 1} unit(s)</p>
                    </div>
                  </div>

                  {qvStock > 0 ? (
                    <div className="mt-auto space-y-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Qty</span>
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => setQvQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-12 text-center text-sm font-bold">{qvQty}</span>
                          <button onClick={() => setQvQty(q => Math.min(qvStock, q + 1))} className="w-10 h-10 flex items-center justify-center text-gray-600 hover:bg-gray-50">
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={() => { requireAuth(() => { for (let i = 0; i < qvQty; i++) addToCart(quickView); setQuickView(null); toast.success("Added to cart"); }); }}
                          className="flex-1 py-3.5 border-2 border-black text-black rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-black hover:text-white transition"
                        >
                          Add to Cart
                        </button>
                        <button
                          onClick={() => { requireAuth(() => { for (let i = 0; i < qvQty; i++) addToCart(quickView); setQuickView(null); navigate("/cart"); }); }}
                          className="flex-1 py-3.5 bg-emerald-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-emerald-700 transition"
                        >
                          Buy Now
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-auto text-center py-4 bg-red-50 text-red-600 font-bold rounded-lg uppercase tracking-widest text-xs">
                      Out of Stock
                    </div>
                  )}

                  <div className="mt-4 text-center">
                    <button onClick={() => navigate(`/marketplace/product/${quickView._id}`)} className="text-xs text-center text-gray-400 underline underline-offset-4 mt-3 block cursor-pointer hover:text-gray-900 transition mx-auto">
                      View full details →
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>

      <AnimatePresence>
        {showCompareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-auto relative p-8 shadow-2xl font-sans"
            >
              <button onClick={() => setShowCompareModal(false)} className="absolute top-6 right-6 p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition">
                <X className="w-5 h-5 text-black" />
              </button>
              <h2 className="text-2xl font-bold text-gray-900 mb-8 tracking-tight">Product Comparison</h2>

              <div className="overflow-x-auto">
                <table className="w-full text-left table-fixed">
                  <thead>
                    <tr>
                      <th className="w-48 p-4 font-semibold text-gray-400 uppercase tracking-widest text-xs border-b border-gray-100">Features</th>
                      {compareList.map(c => (
                        <th key={c._id} className="p-4 border-b border-gray-100 relative align-top">
                          <button onClick={() => {
                            setCompareList(prev => prev.filter(x => x._id !== c._id));
                            if (compareList.length <= 2) setShowCompareModal(false);
                          }} className="absolute top-4 right-4 p-1.5 bg-red-50 text-red-500 hover:bg-red-500 hover:text-white rounded-md transition">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="h-32 mb-4 bg-[#f5f5f5] rounded-xl flex items-center justify-center overflow-hidden">
                            {c.image ? <img src={`http://localhost:5000${c.image}`} className="h-full object-contain p-2" /> : <Package className="w-10 h-10 text-gray-300" />}
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm truncate">{c.name}</h3>
                          <p className="text-emerald-600 font-semibold mt-1">Rs {Number(getDisplayPrice(c)).toLocaleString()}</p>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    <tr>
                      <td className="p-4 font-semibold text-xs uppercase tracking-widest text-gray-400">Category</td>
                      {compareList.map(c => <td key={c._id} className="p-4 text-sm font-medium text-gray-900">{c.category?.name || "-"}</td>)}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-xs uppercase tracking-widest text-gray-400">Availability</td>
                      {compareList.map(c => <td key={c._id} className="p-4 text-sm font-medium">
                        {c.stock > 10 ? <span className="text-emerald-600">In Stock</span> : c.stock > 0 ? <span className="text-amber-600">Low Stock</span> : <span className="text-red-600">Out of Stock</span>}
                      </td>)}
                    </tr>
                    <tr>
                      <td className="p-4 font-semibold text-xs uppercase tracking-widest text-gray-400">Action</td>
                      {compareList.map(c => <td key={c._id} className="p-4">
                        <button
                          onClick={() => { requireAuth(() => { addToCart(c); }); toast.success("Added to cart"); }}
                          disabled={c.stock === 0}
                          className="w-full py-2.5 bg-black text-white font-bold uppercase tracking-widest text-[10px] rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
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

      {/* Compare Bar */}
      <AnimatePresence>
        {compareList.length > 0 && !showCompareModal && (
          <motion.div
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            exit={{ y: 100 }}
            className="fixed bottom-0 left-0 right-0 z-[60] bg-[#0f0f0f] border-t border-white/10 shadow-2xl p-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-4 max-w-screen-xl mx-auto w-full">
              <div className="text-white">
                <span className="font-bold text-sm block">Compare Products</span>
                <span className="text-xs text-white/50">{compareList.length}/3 selected</span>
              </div>
              <div className="flex gap-2 flex-1">
                {compareList.map(c => (
                  <div key={c._id} className="relative w-12 h-12 bg-white/5 border border-white/10 rounded-md overflow-hidden">
                    {c.image ? <img src={`http://localhost:5000${c.image}`} className="w-full h-full object-contain p-1" /> : <Package className="w-full h-full p-2 text-white/30" />}
                    <button onClick={() => setCompareList(prev => prev.filter(x => x._id !== c._id))} className="absolute -top-1 -right-1 bg-black text-white rounded-full p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setCompareList([])} className="text-xs font-bold uppercase tracking-widest text-white/40 hover:text-white transition px-4">
                  Clear
                </button>
                <button
                  onClick={() => setShowCompareModal(true)}
                  disabled={compareList.length < 2}
                  className="bg-white text-black px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition disabled:opacity-50"
                >
                  Compare
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}