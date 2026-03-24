// src/pages/retailer/ProductDetail.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Plus, Minus, Package, Heart, ShoppingBag,
  ChevronDown, MapPin, RefreshCw, Truck, Shield,
  Store, Star, Search, User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

  useEffect(() => {
    if (product) setQuantity(product.moq || 1);
  }, [product]);

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
    const info = product.priceInfo || {};
    const legacy = product.price || product.wholesalerPrice || 0;
    if (!user) return info.finalPrice || legacy;
    if (user.role === "retailer") return info.purchasePrice || legacy;
    if (user.role === "wholesaler") return info.sellingPrice || legacy;
    return info.finalPrice || legacy;
  };

  const getSuggestedPrice = () =>
    product.priceInfo?.suggestedSellingPrice ||
    Math.round((product.wholesalerPrice || product.price || 0) * 1.38);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    navigate("/cart");
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
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2 border border-gray-100">
                <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400 mb-3">Bulk Pricing</p>
                {product.bulkPricing.map((tier, i) => (
                  <div key={i} className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Buy <strong className="text-gray-900">{tier.minQuantity}+</strong></span>
                    <span className="font-semibold text-emerald-600">Rs {tier.pricePerUnit} / unit</span>
                  </div>
                ))}
              </div>
            )}

            {/* Quantity + CTA — only non-wholesaler */}
            {user?.role !== "wholesaler" && (
              <div className="space-y-3">
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
                  onClick={() => setInWishlist(!inWishlist)}
                  className="w-full py-4 rounded-full text-sm font-semibold border border-gray-200 text-gray-700 hover:border-gray-400 transition flex items-center justify-center gap-2"
                >
                  <Heart className={`w-4 h-4 ${inWishlist ? "fill-red-500 text-red-500" : ""}`} />
                  {inWishlist ? "Saved" : "Favourite"}
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
                <button
                  onClick={() => alert("Live chat / negotiation coming soon!")}
                  className="w-full py-3.5 rounded-full text-xs font-medium border border-dashed border-gray-300 text-gray-500 hover:border-gray-500 hover:text-gray-700 transition"
                >
                  Request a Quote · Negotiate Price
                </button>
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
                <p><strong>Supplier:</strong> {product.seller?.businessName || product.seller?.firstName || "eAson Verified Supplier"}</p>
                <p><strong>Location:</strong> {product.seller?.address || "Kathmandu, Nepal"}</p>
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

        {/* ── Vendor Card ── */}
        <section className="mt-20 border-t border-gray-100 pt-14">
          <h2 className="text-xl font-semibold text-gray-900 mb-8">Sold by</h2>
          <div className="flex items-start gap-6 p-6 bg-[#f9f9f9] rounded-3xl border border-gray-100">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
              <Store className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-semibold text-gray-900">
                  {product.seller?.businessName || product.seller?.firstName || "eAson Verified Supplier"}
                </h3>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                  VERIFIED
                </span>
              </div>
              <p className="text-sm text-gray-500 flex items-center gap-1.5 mb-3">
                <MapPin className="w-3.5 h-3.5" />
                {product.seller?.address || "Kathmandu, Nepal"}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> 4.8 rating
                </span>
                <span>· Member since 2024</span>
                <span>· Kathmandu Valley</span>
              </div>
            </div>
            <button className="px-5 py-2.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 hover:text-black transition shrink-0">
              View Store
            </button>
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