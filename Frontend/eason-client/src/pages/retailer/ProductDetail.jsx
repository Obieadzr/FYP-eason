// src/pages/retailer/ProductDetail.jsx
import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import ChatButton from "../../components/chat/ChatButton.jsx";
import {
  ArrowLeft, Plus, Minus, Package, Heart, ShoppingBag,
  ChevronDown, MapPin, RefreshCw, Truck, Shield,
  Store, Star, Search, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../utils/api";
import { useCart } from "../../context/CartContext.jsx";
import { useAuthStore } from "../../store/authStore.js";

/* ─── Sticky navbar that starts transparent and becomes solid on scroll ─── */
function StickyNav() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  const [solid, setSolid] = useState(false);
  useEffect(() => {
    const handler = () => setSolid(window.scrollY > 80);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        solid
          ? "bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/marketplace")}
          className={`flex items-center gap-2 text-sm font-medium transition ${solid ? "text-gray-700 hover:text-black" : "text-white/80 hover:text-white"}`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <Link to="/" className={`text-xl font-bold tracking-tight transition ${solid ? "text-gray-900" : "text-white"}`}>
          eAson<span className="text-emerald-400">.</span>
        </Link>

        <div className="flex items-center gap-3">
          <button className={`p-2 rounded-full transition hover:bg-black/10 ${solid ? "text-gray-600" : "text-white"}`}>
            <Search className="w-5 h-5" />
          </button>
          <button
            onClick={() => navigate("/cart")}
            className={`relative p-2 rounded-full transition hover:bg-black/10 ${solid ? "text-gray-600" : "text-white"}`}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate("/profile")}
            className={`p-2 rounded-full transition hover:bg-black/10 ${solid ? "text-gray-600" : "text-white"}`}
          >
            <User className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─── Accordion row ─────────────────────────────────────────────────────── */
function Accordion({ icon: Icon, title, children }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-t border-gray-100">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="flex items-center gap-3 text-sm font-semibold text-gray-800">
          {Icon && <Icon className="w-4 h-4 text-gray-400" />}
          {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="pb-6 text-sm text-gray-600 leading-relaxed space-y-2">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────────────────────── */
export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [inWishlist, setInWishlist] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedVariants, setSelectedVariants] = useState({});

  const availableVariants = useMemo(() => {
    if (!product?.attributes) return [];
    
    // Determine which array-based attributes represent selectable options.
    const variantKeys = ['color', 'sizes', 'shade', 'dyeShade', 'flavor', 'flavorOrVariant', 'size'];
    return Object.entries(product.attributes)
      .filter(([key, value]) => variantKeys.includes(key) && Array.isArray(value) && value.length > 0)
      .map(([key, value]) => ({
        key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        options: value
      }));
  }, [product]);

  const isAllVariantsSelected = availableVariants.every(v => selectedVariants[v.key]);

  useEffect(() => {
    if (product) setQuantity(product.moq || 1);
  }, [product]);

  useEffect(() => {
    if (user && user.wishlist && product) {
      setInWishlist(user.wishlist.includes(product._id));
    } else if (!user && product) {
      const local = JSON.parse(localStorage.getItem("eason_wishlist")) || [];
      setInWishlist(local.includes(product._id));
    }
  }, [user, product]);

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

  const getDisplayPrice = () => {
    let basePrice = product.wholesalerPrice || product.price || 0;
    const info = product.priceInfo || {};
    
    if (!user) basePrice = info.finalPrice || basePrice;
    else if (user.role === "retailer") basePrice = info.purchasePrice || basePrice;
    else if (user.role === "wholesaler") basePrice = info.sellingPrice || basePrice;
    else basePrice = info.finalPrice || basePrice;

    if (user?.role === "retailer" && product.bulkPricing && product.bulkPricing.length > 0) {
      const sortedTiers = [...product.bulkPricing].sort((a, b) => b.minQuantity - a.minQuantity);
      for (const tier of sortedTiers) {
        if (quantity >= tier.minQuantity) {
          return tier.pricePerUnit;
        }
      }
    }
    return basePrice;
  };

  const getSuggestedPrice = () =>
    product.priceInfo?.suggestedSellingPrice ||
    Math.round((product.wholesalerPrice || product.price || 0) * 1.38);

  const handleAddToCart = () => {
    if (!isAllVariantsSelected) {
      toast.error("Please select all options before adding to bag");
      return;
    }
    addToCart(product, quantity, selectedVariants);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleBuyNow = () => {
    if (!isAllVariantsSelected) {
      toast.error("Please select all options before buying");
      return;
    }
    addToCart(product, quantity, selectedVariants);
    navigate("/cart");
  };

  const handleWishlistToggle = async () => {
    const newVal = !inWishlist;
    setInWishlist(newVal);
    
    if (user) {
      try {
        await API.post('/wishlist/toggle', { productId: product._id });
        toast.success(newVal ? "Saved to your list" : "Removed from list");
      } catch (err) {
        setInWishlist(!newVal);
      }
    } else {
      let local = JSON.parse(localStorage.getItem("eason_wishlist")) || [];
      if (newVal) local.push(product._id);
      else local = local.filter(id => id !== product._id);
      localStorage.setItem("eason_wishlist", JSON.stringify(local));
      toast.success(newVal ? "Saved to your list" : "Removed from list");
    }
  };

  const isOutOfStock = product?.stock === 0;

  /* ─── Loading ──────────────────────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-gray-200 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4">
        <Package className="w-16 h-16 text-gray-200" />
        <p className="text-gray-500 text-lg">Product not found.</p>
        <button
          onClick={() => navigate("/marketplace")}
          className="mt-2 px-6 py-3 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition"
        >
          Back to Marketplace
        </button>
      </div>
    );
  }

  const thumbnails = product?.images?.length > 0
    ? product.images.map(img => `http://localhost:5000${img}`)
    : [
        `http://localhost:5000${product.image}`,
        `http://localhost:5000${product.image}`,
        `http://localhost:5000${product.image}`,
      ];

  /* ─── Page ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}>
      <StickyNav />

      {/* ── Hero image bleed (before the 2-col layout) ── */}
      <div className="relative h-[35vh] min-h-[220px] bg-[#f5f5f5] overflow-hidden">
        {product.image ? (
          <img
            src={`http://localhost:5000${product.image}`}
            alt={product.name}
            className="w-full h-full object-cover opacity-30 blur-sm scale-110"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200" />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-white" />
        {/* Breadcrumb */}
        <div className="absolute bottom-6 left-6 right-6 max-w-screen-xl mx-auto">
          <div className="flex items-center gap-2 text-xs text-white/60">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <span>/</span>
            <Link to="/marketplace" className="hover:text-white transition">Marketplace</Link>
            <span>/</span>
            <span className="text-white/90">{product.name}</span>
          </div>
        </div>
      </div>

      {/* ── 2-column layout ── */}
      <div className="max-w-screen-xl mx-auto px-6 pb-24 -mt-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* LEFT — Images */}
          <div className="sticky top-24">
            {/* Main image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="aspect-square bg-[#f5f5f5] rounded-3xl overflow-hidden mb-4 shadow-xl"
            >
              {product.image ? (
                <img
                  src={selectedImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-8"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-20 h-20 text-gray-300" />
                </div>
              )}
            </motion.div>

            {/* Thumbnails */}
            <div className="flex gap-3">
              {thumbnails.map((src, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(src)}
                  className={`flex-1 aspect-square rounded-2xl overflow-hidden border-2 transition ${
                    selectedImage === src ? "border-black" : "border-transparent bg-[#f5f5f5] hover:border-gray-300"
                  }`}
                >
                  <img src={src} alt={`view-${i}`} className="w-full h-full object-contain p-3" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT — Details */}
          <div className="pt-4 space-y-7">

            {/* Category + name */}
            <div>
              <p className="text-[11px] text-gray-400 uppercase tracking-widest mb-2">
                {product.category?.name || "General"}
              </p>
              <h1 className="text-3xl font-semibold text-gray-900 leading-tight">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-gray-500 text-sm mt-2 leading-relaxed line-clamp-2">
                  {product.description}
                </p>
              )}
            </div>

            {/* Price */}
            <div className="space-y-1">
              <div className="text-2xl font-bold text-gray-900">
                Rs {Number(getDisplayPrice()).toLocaleString()}
              </div>
              <p className="text-xs text-gray-400">
                {!user ? "Public price" : user.role === "retailer" ? "Your purchase price · incl. all taxes" : "Your selling price"}
              </p>
              {user?.role === "retailer" && (
                <p className="text-sm text-emerald-600 font-medium">
                  Sell at Rs {Number(getSuggestedPrice()).toLocaleString()} → earn Rs {Number(getSuggestedPrice() - getDisplayPrice()).toLocaleString()}
                </p>
              )}
            </div>

            {/* Stock badge */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isOutOfStock ? "bg-red-400" : product.stock > 10 ? "bg-emerald-400" : "bg-amber-400"}`} />
              <span className={`text-sm font-medium ${isOutOfStock ? "text-red-500" : product.stock > 10 ? "text-gray-700" : "text-amber-600"}`}>
                {isOutOfStock ? "Out of Stock" : product.stock > 10 ? "In Stock" : `Only ${product.stock} left`}
              </span>
            </div>

            {/* MOQ */}
            {(product.moq || 1) > 1 && (
              <div className="flex items-center gap-2 bg-amber-50 text-amber-800 text-xs font-medium px-4 py-2.5 rounded-xl border border-amber-200 w-fit">
                Minimum order: {product.moq} units
              </div>
            )}

            {/* Bulk pricing tiers */}
            {product.bulkPricing?.length > 0 && (
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-5 space-y-3 border border-emerald-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500 rounded-full blur-3xl opacity-10"></div>
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-800 mb-2 flex items-center gap-2">
                  <Package className="w-4 h-4" /> Volume Discounts
                </p>
                {product.bulkPricing.map((tier, i) => {
                  const isBestDeal = i === product.bulkPricing.length - 1;
                  return (
                    <div key={i} className="flex flex-wrap justify-between items-center text-sm bg-white/60 p-3 rounded-xl border border-white relative z-10 transition hover:bg-white hover:shadow-sm cursor-default">
                      <span className="text-gray-700 font-medium">Buy <strong className="text-emerald-700 font-black">{tier.minQuantity}+</strong> units</span>
                      <div className="text-right flex items-center gap-2">
                        <span className="font-black text-emerald-600">
                          Rs {tier.pricePerUnit.toLocaleString()} / unit
                        </span>
                        {isBestDeal && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-md font-black shadow-sm flex items-center gap-1 animate-pulse">🔥 BEST DEAL</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quantity + CTA — only non-wholesaler */}
            {user?.role !== "wholesaler" && (
              <div className="space-y-4">
                {/* Variant Selectors */}
                {availableVariants.map((variant) => (
                  <div key={variant.key} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-900">{variant.label}</span>
                      <span className="text-xs font-semibold text-emerald-600">
                        {selectedVariants[variant.key] ? 
                          (typeof selectedVariants[variant.key] === 'object' ? selectedVariants[variant.key].name : selectedVariants[variant.key]) 
                          : "Select an option"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                       {variant.options.map((opt, i) => {
                         const isColor = typeof opt === 'object' && opt.hex;
                         const isSelected = selectedVariants[variant.key] === opt || 
                                          (isColor && selectedVariants[variant.key]?.hex === opt.hex);
                         
                         if (isColor) {
                           return (
                             <button
                               key={opt.hex}
                               onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.key]: opt }))}
                               title={opt.name}
                               className={`w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center ${
                                 isSelected ? "border-black scale-110 shadow-md p-1" : "border-transparent hover:scale-105"
                               }`}
                             >
                               <span className="w-full h-full rounded-full border border-gray-200" style={{ backgroundColor: opt.hex }} />
                             </button>
                           );
                         }

                         return (
                           <button
                             key={opt}
                             onClick={() => setSelectedVariants(prev => ({ ...prev, [variant.key]: opt }))}
                             className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                               isSelected
                                 ? "bg-black text-white shadow-md border-black"
                                 : "bg-gray-50 text-gray-700 hover:bg-gray-100 border-transparent"
                             } border`}
                           >
                             {opt}
                           </button>
                         );
                       })}
                    </div>
                  </div>
                ))}

                {/* Qty selector */}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500 w-20">Quantity</span>
                  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(product.moq || 1, quantity - 1))}
                      disabled={isOutOfStock}
                      className="px-4 py-3 hover:bg-gray-50 text-gray-700 transition disabled:opacity-40"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-6 py-3 text-sm font-semibold border-x border-gray-200">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock || 999, quantity + 1))}
                      disabled={isOutOfStock}
                      className="px-4 py-3 hover:bg-gray-50 text-gray-700 transition disabled:opacity-40"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Add to Cart */}
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`w-full py-4 rounded-full text-sm font-semibold transition ${
                    isOutOfStock
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : addedToCart
                      ? "bg-emerald-600 text-white"
                      : "bg-black text-white hover:bg-gray-900"
                  }`}
                >
                  {addedToCart ? "✓ Added to Cart" : isOutOfStock ? "Out of Stock" : "Add to Bag"}
                </motion.button>

                {/* Favourite */}
                <button
                  onClick={handleWishlistToggle}
                  className="w-full py-4 rounded-full text-sm font-semibold border border-gray-200 text-gray-700 hover:border-gray-400 transition flex items-center justify-center gap-2"
                >
                  <Heart className={`w-4 h-4 transition-colors ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                  {inWishlist ? "Saved to Wishlist" : "Favourite"}
                </button>

                {/* Buy now */}
                {!isOutOfStock && (
                  <button
                    onClick={handleBuyNow}
                    className="w-full py-4 rounded-full text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 transition"
                  >
                    Buy Now
                  </button>
                )}

                {/* Negotiate */}
                {product.wholesaler?._id && (
                  <ChatButton 
                    wholesalerId={product.wholesaler._id} 
                    productId={product._id} 
                    label="Make an Offer / Request Quote"
                    className="w-full justify-center py-4 rounded-full text-sm bg-transparent border-dashed border-2 border-emerald-500 text-emerald-700 font-bold hover:bg-emerald-50 transition flex items-center gap-2" 
                  />
                )}
              </div>
            )}

            {/* Wholesaler notice */}
            {user?.role === "wholesaler" && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-800">
                You're viewing as a wholesaler. You can't purchase your own listed products, but you can browse items from other wholesalers.
              </div>
            )}

            {/* ── Accordion info sections ── */}
            <div className="pt-4">

              {/* Free delivery */}
              <div className="flex items-center gap-3 py-4 border-t border-gray-100">
                <Truck className="w-4 h-4 text-gray-400 shrink-0" />
                <p className="text-sm text-gray-600">Free delivery on orders over Rs 5,000 · 2–4 business days</p>
              </div>

              <Accordion icon={RefreshCw} title="Return & Exchange Policy">
                <p>Items may be returned within <strong>7 days</strong> of delivery if they are unopened and in original condition.</p>
                <p>Damaged or incorrect items must be reported within <strong>24 hours</strong> of receipt. Contact support with order ID and photos.</p>
                <p>Customized or bulk-order items are <strong>non-refundable</strong> unless defective.</p>
                <p className="text-xs text-gray-400 pt-2">For returns, email <span className="text-emerald-600">support@eason.com.np</span> or call +977-1-XXXXXX.</p>
              </Accordion>

              <Accordion icon={MapPin} title="Manufacturer & Origin">
                <p><strong>Supplier:</strong> {product.wholesaler?.companyName || product.wholesaler?.firstName || "eAson Verified Supplier"}</p>
                <p><strong>Location:</strong> Kathmandu, Nepal</p>
                <p><strong>Category:</strong> {product.category?.name || "General Merchandise"}</p>
                <p><strong>SKU:</strong> #{product._id?.slice(-8).toUpperCase()}</p>
              </Accordion>

              <Accordion icon={Shield} title="Buyer Protection">
                <p>All purchases on eAson are covered by our <strong>Buyer Protection Policy</strong>.</p>
                <p>We hold payments in escrow until you confirm delivery. If goods don't match the listing, you get a full refund.</p>
                <p className="text-xs text-gray-400 pt-2">Powered by eAson Trust · Updated March 2025</p>
              </Accordion>

            </div>
          </div>
        </div>

        {/* ── Product Specifications ── */}
        {product.attributes && Object.keys(product.attributes).length > 0 && (
          <section className="mt-14 pt-10 border-t border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Specifications</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-0">
              {Object.entries(product.attributes).map(([key, value]) => {
                if (value === "" || value === null || (Array.isArray(value) && value.length === 0)) return null;
                
                // Format label: camelCase to Title Case
                const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
                
                let displayValue = value;
                if (typeof value === 'boolean') {
                  displayValue = <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[10px] font-bold uppercase tracking-wider">{value ? "Yes" : "No"}</span>;
                } else if (Array.isArray(value)) {
                  if (value.length > 0 && value[0].hex) {
                    displayValue = (
                      <div className="flex flex-wrap gap-2">
                        {value.map(c => (
                          <span key={c.hex} title={c.name} className="flex items-center gap-1.5 text-xs bg-gray-50 border border-gray-200 px-2 py-1 rounded-md">
                            <span className="w-3 h-3 rounded-full border border-gray-200" style={{ backgroundColor: c.hex }}/>
                            {c.name}
                          </span>
                        ))}
                      </div>
                    );
                  } else {
                     displayValue = (
                       <div className="flex flex-wrap gap-1.5">
                         {value.map(v => <span key={v} className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-md font-medium">{v}</span>)}
                       </div>
                     );
                  }
                } else {
                   displayValue = String(value);
                }

                return (
                  <div key={key} className="flex items-start py-3.5 border-b border-gray-50">
                    <span className="w-1/3 text-sm text-gray-500 font-medium">{label}</span>
                    <span className="w-2/3 text-sm text-gray-900 font-semibold">{displayValue}</span>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Vendor Card ── */}
        <section className="mt-14 border-t border-gray-100 pt-10">
          <h2 className="text-xl font-semibold text-gray-900 mb-8">Sold by</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 md:p-8 bg-[#f9f9f9] rounded-3xl border border-gray-100 transition hover:shadow-lg">
            <div className="w-16 h-16 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
              <Store className="w-8 h-8 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="text-lg font-bold text-gray-900">
                  {product.wholesaler?.companyName || product.wholesaler?.firstName || "eAson Verified Supplier"}
                </h3>
                {product.wholesaler?.verified && (
                  <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Shield className="w-3 h-3" /> VERIFIED
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                <MapPin className="w-4 h-4 text-gray-400" />
                Kathmandu, Nepal
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 font-medium">
                <span className="flex items-center gap-1">
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" /> 4.9 rating
                </span>
                <span>· Supplier since 2024</span>
              </div>
            </div>
            {product.wholesaler?._id && (
              <button 
                onClick={() => navigate(`/supplier/${product.wholesaler._id}`)}
                className="w-full md:w-auto px-6 py-3.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition shrink-0 mt-4 md:mt-0"
              >
                Visit Storefront
              </button>
            )}
          </div>
        </section>

        {/* ── Description (full) ── */}
        {product.description && (
          <section className="mt-14 pt-10 border-t border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">About this product</h2>
            <p className="text-gray-600 text-sm leading-7 max-w-2xl">{product.description}</p>
          </section>
        )}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-[#fafafa]">
        <div className="max-w-screen-xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <Link to="/" className="text-lg font-bold text-gray-900 tracking-tight">
            eAson<span className="text-emerald-400">.</span>
          </Link>
          <div className="flex items-center gap-6 text-xs text-gray-400">
            <Link to="/" className="hover:text-gray-700 transition">Home</Link>
            <Link to="/marketplace" className="hover:text-gray-700 transition">Marketplace</Link>
            <a href="#" className="hover:text-gray-700 transition">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700 transition">Terms of Service</a>
            <a href="#" className="hover:text-gray-700 transition">Contact</a>
          </div>
          <p className="text-xs text-gray-300">© 2025 eAson Nepal</p>
        </div>
      </footer>
    </div>
  );
}