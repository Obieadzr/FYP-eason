// src/pages/retailer/Cart.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate, Link } from "react-router-dom";
import {
  Trash2, Plus, Minus, ArrowRight, MapPin, Package,
  AlertCircle, Wallet, CheckCircle, Lock, Smartphone,
  ArrowLeft, Loader2, ShoppingBag, Search, User, Heart, X,
  Truck, Info
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import API from "../../utils/api";
import { useAuthStore } from "../../store/authStore";

/* ─── helpers ────────────────────────────────────────────────────────────────── */
function getDeliveryDate() {
  const d = new Date();
  let added = 0;
  while (added < 3) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) added++;
  }
  return d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
}

function TaxTooltip() {
  const [show, setShow] = React.useState(false);
  return (
    <span className="relative inline-flex items-center ml-1">
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="text-gray-400 hover:text-gray-600 transition"
      >
        <Info className="w-3.5 h-3.5" />
      </button>
      {show && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 bg-gray-800 text-white text-xs rounded-lg px-3 py-2 z-50 leading-relaxed">
          13% VAT applied as per Nepal tax regulations. Included in the displayed total.
          <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800" />
        </span>
      )}
    </span>
  );
}

/* ─── Minimal top nav ─────────────────────────────────────────────────────── */
function CartNav() {
  const navigate = useNavigate();
  const { cartCount } = useCart();
  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-screen-xl mx-auto px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate("/marketplace")}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-black transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue shopping
        </button>

        <Link to="/" className="text-xl font-bold text-gray-900 tracking-tight">
          eAson<span className="text-emerald-400">.</span>
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("/marketplace")}
            className="p-2 text-gray-400 hover:text-black transition rounded-full hover:bg-gray-100"
          >
            <Search className="w-5 h-5" />
          </button>
          <button className="relative p-2 text-gray-900 hover:text-black transition rounded-full bg-gray-100">
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

/* ─── Step indicator ──────────────────────────────────────────────────────── */
function Stepper({ step }) {
  const steps = ["Bag", "Shipping", "Payment", "Review"];
  return (
    <div className="flex items-center justify-center gap-0 mb-12">
      {steps.map((label, i) => {
        const n = i + 1;
        const done   = step > n;
        const active = step === n;
        return (
          <React.Fragment key={label}>
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                done   ? "bg-emerald-500 text-white" :
                active ? "bg-black text-white" :
                         "bg-gray-100 text-gray-400"
              }`}>
                {done ? <CheckCircle className="w-4 h-4" /> : n}
              </div>
              <span className={`mt-1.5 text-xs font-medium ${active || done ? "text-gray-900" : "text-gray-400"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-16 h-px mb-5 mx-1 ${step > n ? "bg-emerald-400" : "bg-gray-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Order Summary sidebar ───────────────────────────────────────────────── */
function OrderSummary({ cart, cartTotal }) {
  const tax      = Math.round(cartTotal * 0.13);
  const grandTotal = cartTotal + tax;
  return (
    <div className="bg-[#f9f9f9] rounded-2xl p-6 border border-gray-100 sticky top-28">
      <h3 className="text-sm font-semibold text-gray-800 mb-5">Order Summary</h3>

      {/* Items */}
      <div className="space-y-3 mb-5 max-h-48 overflow-y-auto pr-1">
        {cart.map(item => (
          <div key={item._id} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 overflow-hidden shrink-0">
              {item.image
                ? <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-contain p-1" />
                : <Package className="w-5 h-5 text-gray-300 m-auto" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-gray-900 truncate">{item.name}</p>
              <p className="text-xs text-gray-400">×{item.quantity}</p>
            </div>
            <span className="text-xs font-semibold text-gray-900 shrink-0">
              Rs {(item.pricePerUnit * item.quantity).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {/* Price breakdown */}
      <div className="space-y-2 pt-4 border-t border-gray-200 text-sm">
        <div className="flex justify-between text-gray-500">
          <span>Subtotal</span>
          <span>Rs {cartTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span>Delivery</span>
          <span className="text-emerald-600 font-medium">Free</span>
        </div>
        <div className="flex justify-between text-gray-500">
          <span className="flex items-center">Tax (13%) <TaxTooltip /></span>
          <span>Rs {tax.toLocaleString()}</span>
        </div>
        <div className="flex justify-between pt-3 border-t border-gray-200 font-bold text-base text-gray-900">
          <span>Total</span>
          <span>Rs {grandTotal.toLocaleString()}</span>
        </div>
        {/* Estimated delivery */}
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
          <Truck className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-xs text-gray-500">Est. Delivery: <span className="font-semibold">{getDeliveryDate()}</span></span>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-2 text-xs text-gray-400">
        <Lock className="w-3.5 h-3.5" />
        Secure, encrypted checkout
      </div>
    </div>
  );
}

/* ─── Main ─────────────────────────────────────────────────────────────────── */
export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart } = useCart();
  const navigate   = useNavigate();
  const { user }   = useAuthStore();

  const [step, setStep]             = useState(1);
  const [shippingInfo, setShippingInfo] = useState({ address: "", phone: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [loading, setLoading]           = useState(true);
  const [showPayModal, setShowPayModal] = useState(false);
  const [fakeWalletNumber, setFakeWalletNumber] = useState("");
  const [fakeMpin, setFakeMpin]         = useState("");

  /* stock validation */
  useEffect(() => {
    const validateCartStock = async () => {
      if (!cart.length) return setLoading(false);
      for (const item of cart) {
        try {
          const res = await API.get(`/products/${item._id}`);
          const currentStock = res.data.stock || 0;
          if (currentStock <= 0) removeFromCart(item._id);
          else if (currentStock < item.quantity) {
            updateQuantity(item._id, currentStock);
            toast(`Adjusted "${item.name}" to max available (${currentStock})`, { icon: "⚠️" });
          }
        } catch {}
      }
      setLoading(false);
    };
    validateCartStock();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tax = Math.round(cartTotal * 0.13);
  const grandTotal = cartTotal + tax;

  const handlePlaceOrderCOD = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Placing order...");
    try {
      const payload = {
        items: cart.map(i => ({ _id: i._id, quantity: i.quantity })),
        shippingAddress: shippingInfo.address,
        phone: shippingInfo.phone,
        notes: shippingInfo.notes || undefined,
        paymentMethod,
      };
      const res = await API.post("/orders", payload);
      toast.success("Order placed! 🎉", { id: toastId });
      clearCart();
      navigate("/order-success", { state: { orderId: res.data.order._id, total: res.data.order.grandTotal || grandTotal } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order.", { id: toastId });
    } finally { setIsProcessing(false); }
  };

  const handleFakePayment = async () => {
    if (!fakeWalletNumber.trim() || !fakeMpin.trim())
      return toast.error("Enter wallet number and MPIN");
    setIsProcessing(true);
    const toastId = toast.loading("Processing payment...");
    try {
      await new Promise(r => setTimeout(r, 2400));
      const payload = {
        items: cart.map(i => ({ _id: i._id, quantity: i.quantity })),
        shippingAddress: shippingInfo.address,
        phone: shippingInfo.phone,
        notes: shippingInfo.notes || undefined,
        paymentMethod,
      };
      const res = await API.post("/orders", payload);
      toast.success("Payment successful! ✅", { id: toastId });
      clearCart();
      setShowPayModal(false);
      navigate("/order-success", { state: { orderId: res.data.order._id, total: res.data.order.grandTotal || grandTotal } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed.", { id: toastId });
    } finally { setIsProcessing(false); }
  };

  /* ─── Empty state ─── */
  if (!loading && cart.length === 0 && step === 1) {
    return (
      <>
        <CartNav />
        <div className="min-h-[80vh] flex flex-col items-center justify-center gap-5 px-6">
          <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center">
            <ShoppingBag className="w-9 h-9 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Your bag is empty</h2>
          <p className="text-gray-400 text-sm">Looks like you haven't added anything yet.</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="mt-2 px-8 py-4 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition"
          >
            Browse Products
          </button>
        </div>
      </>
    );
  }

  return (
    <>
      <CartNav />

      <div
        className="min-h-screen bg-white"
        style={{ fontFamily: "'Inter', sans-serif", letterSpacing: "-0.01em" }}
      >
        <div className="max-w-screen-xl mx-auto px-6 py-12">
          <Stepper step={step} />

          {/* ── Step 1: Bag ── */}
          {step === 1 && (
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              {/* Items */}
              <div className="lg:col-span-7">
                <div className="flex items-center justify-between mb-6">
                  <h1 className="text-2xl font-semibold text-gray-900">
                    My Bag <span className="text-gray-400 font-normal text-base">({cartCount} items)</span>
                  </h1>
                  <button
                    onClick={clearCart}
                    className="text-xs text-gray-400 hover:text-red-500 flex items-center gap-1 transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear all
                  </button>
                </div>

                {loading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-8 h-8 text-gray-300 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-0 divide-y divide-gray-100">
                    <AnimatePresence>
                      {cart.map(item => (
                        <motion.div
                          key={item._id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -20 }}
                          className="flex gap-5 py-6"
                        >
                          {/* Image */}
                          <div
                            className="w-28 h-28 shrink-0 bg-[#f5f5f5] rounded-2xl overflow-hidden cursor-pointer"
                            onClick={() => navigate(`/marketplace/product/${item._id}`)}
                          >
                            {item.image
                              ? <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-contain p-3" />
                              : <Package className="w-10 h-10 text-gray-300 m-auto" />
                            }
                          </div>

                          {/* Info */}
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between">
                              <div>
                                <p
                                  className="font-medium text-gray-900 hover:text-emerald-600 cursor-pointer transition text-sm"
                                  onClick={() => navigate(`/marketplace/product/${item._id}`)}
                                >
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  Rs {item.pricePerUnit.toLocaleString()} / unit
                                </p>
                              </div>
                              <button
                                onClick={() => removeFromCart(item._id)}
                                className="text-gray-300 hover:text-red-500 transition p-1 h-fit"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>

                            <div className="flex items-center justify-between mt-3">
                              {/* Qty */}
                              <div className="flex items-center border border-gray-200 rounded-full overflow-hidden">
                                <button
                                  onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                  disabled={item.quantity <= 1}
                                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 disabled:opacity-40 transition"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="w-10 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                                <button
                                  onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                  className="w-8 h-8 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <span className="text-sm font-semibold text-gray-900">
                                Rs {(item.pricePerUnit * item.quantity).toLocaleString()}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* Summary */}
              <div className="lg:col-span-5">
                <OrderSummary cart={cart} cartTotal={cartTotal} />
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setStep(2)}
                  className="mt-4 w-full py-4 bg-black text-white rounded-full font-semibold text-sm hover:bg-gray-900 transition flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </motion.button>
                {!user && (
                  <p className="text-center text-xs text-gray-400 mt-3">
                    <button onClick={() => navigate("/login")} className="text-emerald-600 hover:underline">Sign in</button> to access your saved items
                  </p>
                )}
              </div>
            </div>
          )}

          {/* ── Step 2: Shipping ── */}
          {step === 2 && (
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-2xl font-semibold text-gray-900">Delivery Details</h1>

                <div className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Delivery Address *
                    </label>
                    <textarea
                      rows={3}
                      value={shippingInfo.address}
                      onChange={e => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                      placeholder="e.g. House 12B, Putalisadak, Ward 4, Kathmandu"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none placeholder-gray-400"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={shippingInfo.phone}
                      onChange={e => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      placeholder="98XXXXXXXX"
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 placeholder-gray-400"
                    />
                    <p className="text-xs text-gray-400 mt-1.5 ml-1">We'll send your order updates to this number via SMS</p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Delivery Notes <span className="normal-case text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={shippingInfo.notes}
                      onChange={e => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                      placeholder="Any special instructions for the delivery rider..."
                      className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 resize-none placeholder-gray-400"
                    />
                    {/* Quick-select chips */}
                    <div className="flex flex-wrap gap-2 mt-2">
                      {["Leave at door", "Call before delivery", "Ring bell twice"].map(chip => (
                        <button
                          key={chip}
                          type="button"
                          onClick={() => setShippingInfo(s => ({ ...s, notes: s.notes ? `${s.notes}, ${chip}` : chip }))}
                          className="px-3 py-1.5 text-xs border border-gray-200 rounded-full text-gray-500 hover:border-emerald-500 hover:text-emerald-600 transition"
                        >
                          {chip}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => {
                      if (!shippingInfo.address.trim() || !shippingInfo.phone.trim())
                        return toast.error("Address and phone are required");
                      setStep(3);
                    }}
                    className="flex-1 py-4 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition"
                  >
                    Continue
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <OrderSummary cart={cart} cartTotal={cartTotal} />
              </div>
            </div>
          )}

          {/* ── Step 3: Payment ── */}
          {step === 3 && (
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-2xl font-semibold text-gray-900">Payment</h1>
                <p className="text-sm text-gray-400">Choose how you'd like to pay.</p>

                <div className="space-y-3">
                  {[
                    { id: "khalti",  label: "Khalti",           sub: "Pay via Khalti wallet",    icon: Wallet,     color: "#5C2D91", bg: "#f4eeff" },
                    { id: "esewa",   label: "eSewa",            sub: "Pay via eSewa wallet",     icon: Smartphone, color: "#60BB46", bg: "#f0faee" },
                    { id: "cod",     label: "Cash on Delivery", sub: "Pay when you receive",     icon: MapPin,     color: "#D97706", bg: "#fffbeb" },
                  ].map(({ id, label, sub, icon: Icon, color, bg }) => (
                    <button
                      key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`w-full flex items-center gap-4 p-4 border-2 rounded-2xl transition text-left ${
                        paymentMethod === id ? "border-black" : "border-gray-100 hover:border-gray-200"
                      }`}
                      style={{ background: paymentMethod === id ? bg : "#fff" }}
                    >
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: color }}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-gray-900">{label}</p>
                        <p className="text-xs text-gray-400">{sub}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition ${
                        paymentMethod === id ? "border-black bg-black" : "border-gray-300"
                      }`}>
                        {paymentMethod === id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </button>
                  ))}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 py-4 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 transition"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setStep(4)}
                    className="flex-1 py-4 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition"
                  >
                    Review Order
                  </button>
                </div>
              </div>

              <div className="lg:col-span-5">
                <OrderSummary cart={cart} cartTotal={cartTotal} />
              </div>
            </div>
          )}

          {/* ── Step 4: Review & Confirm ── */}
          {step === 4 && (
            <div className="grid lg:grid-cols-12 gap-10 items-start">
              <div className="lg:col-span-7 space-y-6">
                <h1 className="text-2xl font-semibold text-gray-900">Review & Confirm</h1>

                {/* Items */}
                <div className="border border-gray-100 rounded-2xl overflow-hidden">
                  <div className="px-5 py-3.5 bg-gray-50 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Items ({cart.length})</p>
                  </div>
                  <div className="divide-y divide-gray-50">
                    {cart.map(item => (
                      <div key={item._id} className="flex items-center gap-4 px-5 py-4">
                        <div className="w-12 h-12 bg-[#f5f5f5] rounded-xl overflow-hidden shrink-0">
                          {item.image
                            ? <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-contain p-1.5" />
                            : <Package className="w-5 h-5 text-gray-300 m-auto" />
                          }
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-xs text-gray-400">×{item.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold">Rs {(item.pricePerUnit * item.quantity).toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping summary */}
                <div className="border border-gray-100 rounded-2xl p-5 space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Delivery to</p>
                  <div className="flex items-start gap-3 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                    <div>
                      <p>{shippingInfo.address}</p>
                      <p className="text-gray-400 mt-1">{shippingInfo.phone}</p>
                    </div>
                  </div>
                </div>

                {/* Payment method */}
                <div className="border border-gray-100 rounded-2xl p-5">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Payment</p>
                  <p className="text-sm text-gray-700 font-medium capitalize">
                    {paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "khalti" ? "Khalti" : "eSewa"}
                  </p>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 border border-gray-200 rounded-full text-sm font-medium text-gray-700 hover:border-gray-400 transition"
                  >
                    Back
                  </button>
                  {paymentMethod === "cod" ? (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={handlePlaceOrderCOD}
                      disabled={isProcessing}
                      className="flex-1 py-4 bg-emerald-600 text-white rounded-full text-sm font-semibold hover:bg-emerald-700 disabled:opacity-70 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                    >
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                      {isProcessing ? "Placing..." : "Place Order (COD)"}
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowPayModal(true)}
                      className="flex-1 py-4 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 transition flex items-center justify-center gap-2"
                    >
                      <Lock className="w-4 h-4" /> Pay Securely
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="lg:col-span-5">
                <OrderSummary cart={cart} cartTotal={cartTotal} />
              </div>
            </div>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-100 mt-16">
          <div className="max-w-screen-xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link to="/" className="text-base font-bold text-gray-900 tracking-tight">
              eAson<span className="text-emerald-400">.</span>
            </Link>
            <div className="flex items-center gap-5 text-xs text-gray-400">
              <Link to="/" className="hover:text-gray-700 transition">Home</Link>
              <a href="#" className="hover:text-gray-700 transition">Privacy Policy</a>
              <a href="#" className="hover:text-gray-700 transition">Terms of Service</a>
              <a href="#" className="hover:text-gray-700 transition">Help</a>
            </div>
            <p className="text-xs text-gray-300">© 2025 eAson Nepal</p>
          </div>
        </footer>
      </div>

      {/* ── Payment Modal (Khalti / eSewa) ── */}
      <AnimatePresence>
        {showPayModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={e => { if (e.target === e.currentTarget) setShowPayModal(false); }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl"
              style={{ fontFamily: "'Inter', sans-serif" }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Pay via {paymentMethod === "khalti" ? "Khalti" : "eSewa"}</h3>
                <button onClick={() => setShowPayModal(false)} className="text-gray-400 hover:text-black transition">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Wallet Number</label>
                  <input
                    type="tel"
                    value={fakeWalletNumber}
                    onChange={e => setFakeWalletNumber(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">MPIN</label>
                  <input
                    type="password"
                    maxLength={6}
                    value={fakeMpin}
                    onChange={e => setFakeMpin(e.target.value)}
                    placeholder="••••••"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="mt-4 p-3 bg-gray-50 rounded-xl flex justify-between text-sm font-semibold text-gray-900">
                <span>Total to Pay</span>
                <span>Rs {grandTotal.toLocaleString()}</span>
              </div>

              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={handleFakePayment}
                disabled={isProcessing}
                className="mt-5 w-full py-4 bg-black text-white rounded-full text-sm font-semibold hover:bg-gray-900 disabled:opacity-70 transition flex items-center justify-center gap-2"
              >
                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                {isProcessing ? "Processing..." : "Confirm Payment"}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}