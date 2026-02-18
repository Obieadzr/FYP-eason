// src/pages/retailer/Cart.jsx
import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MapPin,           // ← added missing import
  Package,
  AlertCircle,
  Wallet,
  CheckCircle,
  Lock,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import API from "../../utils/api";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart, getAvailableStock } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({
    address: "",
    phone: "",
    notes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fakeWalletNumber, setFakeWalletNumber] = useState("");
  const [fakeMpin, setFakeMpin] = useState("");

  // ─── Stock Validation ────────────────────────────────────────────────
  useEffect(() => {
    // Only run when cart array reference changes (prevents infinite loops)
    validateCartStock();
  }, [cart]); // ← removed removeFromCart from deps → it shouldn't cause re-renders

  const validateCartStock = async () => {
    if (!cart.length) return;

    let changed = false;
    const newCart = [...cart];
    const toRemove = [];

    for (const item of newCart) {
      try {
        const res = await API.get(`/products/${item._id}`);
        const currentStock = res.data.stock;

        if (currentStock < item.quantity) {
          if (currentStock <= 0) {
            toRemove.push(item._id);
          } else {
            item.quantity = currentStock;
            changed = true;
            toast(`Adjusted ${item.name} to ${currentStock} (max available)`, {
              icon: <AlertCircle className="text-amber-600" />,
            });
          }
        }
      } catch (err) {
        console.warn("Stock check failed:", item.name);
      }
    }

    if (toRemove.length) {
      toRemove.forEach((id) => removeFromCart(id));
      toast.error(`${toRemove.length} item(s) removed — out of stock`);
    }
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (!shippingInfo.address?.trim() || !shippingInfo.phone?.trim()) {
        return toast.error("Address and phone number are required");
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => setStep((prev) => Math.max(1, prev - 1));

  const handleFakePayment = async () => {
  if (!fakeWalletNumber.trim() || !fakeMpin.trim()) {
    return toast.error("Please enter wallet number and MPIN");
  }

  setIsProcessing(true);
  const toastId = toast.loading("Processing payment...");

  try {
    // Fake delay (keep for realism)
    await new Promise((r) => setTimeout(r, 3800));

    const payload = {
      items: cart.map((i) => ({ _id: i._id, quantity: i.quantity })),
      shippingAddress: shippingInfo.address,
      phone: shippingInfo.phone,
      notes: shippingInfo.notes || undefined,
    };

    const res = await API.post("/orders", payload);

    // Check if response has what we need
    if (!res.data?.order?._id) {
      throw new Error("Order ID missing from response");
    }

    toast.success("Payment successful! Order placed.", { id: toastId });
    
    clearCart();
    setShowPaymentModal(false);
    setFakeWalletNumber("");
    setFakeMpin("");

    navigate("/order-success", {
      state: {
        orderId: res.data.order._id,
        total: res.data.order.totalAmount || cartTotal, // fallback to cartTotal if missing
      },
    });
  } catch (err) {
    console.error("Payment error:", err);
    toast.error(
      err.response?.data?.message || "Payment / order failed. Please try again.",
      { id: toastId }
    );
  } finally {
    setIsProcessing(false);
  }
};
  const handlePlaceOrderCOD = async () => {
  setIsProcessing(true);
  const toastId = toast.loading("Placing order...");

  try {
    const payload = {
      items: cart.map((i) => ({ _id: i._id, quantity: i.quantity })),
      shippingAddress: shippingInfo.address,
      phone: shippingInfo.phone,
      notes: shippingInfo.notes || undefined,
    };

    const res = await API.post("/orders", payload);

    // Safety check: make sure order data exists
    if (!res.data?.order?._id) {
      throw new Error("Order creation failed - no order ID returned");
    }

    toast.success("Order placed successfully (Cash on Delivery)", { id: toastId });
    clearCart();

    navigate("/order-success", {
      state: {
        orderId: res.data.order._id,
        total: res.data.order.totalAmount || cartTotal, // fallback to cart total if missing
      },
    });
  } catch (err) {
    console.error("COD order error:", err);
    toast.error(
      err.response?.data?.message || "Failed to place order. Please try again.",
      { id: toastId }
    );
  } finally {
    setIsProcessing(false);
  }
};

  // ─── Order Summary component ────────────────────────────────────────
  const OrderSummary = () => (
    <div className="border border-gray-200 rounded-xl p-6 bg-white">
      <h3 className="text-lg font-medium mb-6 text-gray-900">Order Summary</h3>

      <div className="space-y-4 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">Rs {cartTotal.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Estimated Delivery & Handling</span>
          <span className="text-emerald-600 font-medium">Free</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax (Included)</span>
          <span className="font-medium">Rs {(cartTotal * 0.13).toLocaleString()}</span>
        </div>
        <div className="flex justify-between pt-5 border-t text-base font-medium">
          <span>Total</span>
          <span className="text-emerald-700">Rs {cartTotal.toLocaleString()}</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-8 leading-relaxed">
        Secure Checkout. By placing your order, you agree to our{" "}
        <span className="underline hover:text-emerald-700 cursor-pointer">Terms</span> and{" "}
        <span className="underline hover:text-emerald-700 cursor-pointer">Privacy Policy</span>.
      </p>

      {step === 1 && (
        <button
          onClick={() => setStep(2)}
          disabled={!cart.length}
          className="mt-8 w-full py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition disabled:opacity-50 flex items-center justify-center gap-2"
        >
          Proceed to Checkout <ArrowRight size={18} />
        </button>
      )}
    </div>
  );

  const renderStepper = () => (
    <div className="mb-16 flex justify-center gap-12 md:gap-20">
      {["Cart", "Shipping", "Payment", "Confirm"].map((label, i) => {
        const isActive = step === i + 1;
        const isDone = step > i + 1;
        return (
          <div key={label} className="flex flex-col items-center">
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium border transition-all
                ${isDone ? "bg-emerald-600 text-white border-emerald-600" :
                  isActive ? "border-2 border-emerald-600 text-emerald-600 bg-white" :
                  "border-gray-300 text-gray-400 bg-white"}`}
            >
              {isDone ? <CheckCircle size={18} /> : i + 1}
            </div>
            <span className={`mt-3 text-xs font-medium ${isActive || isDone ? "text-emerald-700" : "text-gray-500"}`}>
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <div className="flex items-baseline justify-between">
                <h2 className="text-3xl font-medium text-gray-900">Cart</h2>
                <span className="text-gray-600">
                  {cartCount} {cartCount === 1 ? "item" : "items"}
                </span>
              </div>

              {cart.length === 0 ? (
                <div className="py-24 text-center">
                  <Package className="mx-auto text-gray-300 mb-6" size={64} />
                  <h3 className="text-2xl font-medium text-gray-800 mb-4">Your cart is empty</h3>
                  <button
                    onClick={() => navigate("/marketplace")}
                    className="px-10 py-4 bg-black text-white rounded-xl font-medium hover:bg-gray-900 transition"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {cart.map((item) => (
                    <div key={item._id} className="py-6 flex gap-6">
                      <div className="w-28 h-28 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                        {item.image ? (
                          <img
                            src={`http://localhost:5000${item.image}`}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-300">
                            <Package size={40} />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <h3 className="font-medium text-gray-900 line-clamp-2">{item.name}</h3>
                          <p className="text-sm text-gray-600 mt-1.5">
                            Rs {item.pricePerUnit.toLocaleString()}
                          </p>
                          {item.quantity > (getAvailableStock(item._id) ?? 999) * 0.7 && (
                            <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                              <AlertCircle size={14} /> Limited stock
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-5">
                          <div className="flex items-center border border-gray-200 rounded-full">
                            <button
                              onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-l-full transition disabled:opacity-40"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={18} />
                            </button>
                            <span className="w-12 text-center font-medium">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="w-10 h-10 flex items-center justify-center hover:bg-gray-50 rounded-r-full transition"
                            >
                              <Plus size={18} />
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="text-gray-400 hover:text-red-500 p-2 transition"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1.5 mt-4 transition"
                >
                  <Trash2 size={14} /> Clear cart
                </button>
              )}
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit">
              <OrderSummary />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="grid lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-10">
              <h2 className="text-3xl font-medium text-gray-900">Shipping Details</h2>

              <div className="space-y-7">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                  <textarea
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    placeholder="House no., Street name, Area, City, Province"
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-0 resize-none text-base"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-0 text-base"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes (optional)</label>
                  <textarea
                    value={shippingInfo.notes}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                    placeholder="Gate code, landmark, preferred time..."
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-0 text-base"
                    rows={2}
                  />
                </div>
              </div>

              <div className="flex gap-5 pt-8">
                <button
                  onClick={handlePrevStep}
                  className="flex-1 py-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition text-base"
                >
                  Back to Cart
                </button>
                <button
                  onClick={handleNextStep}
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-base"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit">
              <OrderSummary />
            </div>
          </div>
        );

      // Payment and Confirm steps kept almost the same — just emerald accents on buttons
      case 3:
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-3xl font-medium text-gray-900">Payment Method</h2>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { id: "khalti", name: "Khalti", icon: Wallet },
                { id: "esewa", name: "eSewa", icon: Smartphone },
                { id: "cod", name: "Cash on Delivery", icon: MapPin },
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`p-8 border rounded-xl text-center transition-all duration-300
                    ${paymentMethod === id
                      ? "border-emerald-600 bg-emerald-50/40"
                      : "border-gray-200 hover:border-emerald-300 hover:bg-emerald-50/20"}`}
                >
                  <Icon className="w-12 h-12 mx-auto mb-4 text-gray-700" />
                  <div className="font-medium text-lg">{name}</div>
                  {paymentMethod === id && (
                    <div className="text-sm text-emerald-600 mt-3">✓ Selected</div>
                  )}
                </button>
              ))}
            </div>

            <div className="flex gap-5 pt-8">
              <button
                onClick={handlePrevStep}
                className="flex-1 py-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition"
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2"
              >
                Review & Confirm <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-5xl mx-auto space-y-12">
            <h2 className="text-3xl font-medium text-gray-900">Confirm Order</h2>

            <div className="grid md:grid-cols-5 gap-10">
              <div className="md:col-span-3">
                <div className="border border-gray-200 rounded-xl p-7">
                  <h3 className="font-medium text-lg mb-6">Order Items</h3>
                  <div className="space-y-6 divide-y divide-gray-100">
                    {cart.map((item) => (
                      <div key={item._id} className="flex justify-between items-center py-5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-5">
                          <div className="w-16 h-16 bg-gray-50 rounded-lg overflow-hidden">
                            {item.image && (
                              <img
                                src={`http://localhost:5000${item.image}`}
                                alt=""
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Qty: {item.quantity} × Rs {item.pricePerUnit.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className="font-medium text-lg">
                          Rs {(item.pricePerUnit * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="border border-gray-200 rounded-xl p-7 sticky top-6">
                  <h3 className="font-medium text-lg mb-6">Order Summary</h3>

                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Items ({cartCount})</span>
                      <span>Rs {cartTotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Delivery</span>
                      <span className="text-emerald-600">Free</span>
                    </div>
                    <div className="flex justify-between pt-5 border-t font-medium text-base">
                      <span>Total</span>
                      <span className="text-emerald-700">Rs {cartTotal.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-medium mb-3">Payment Method</h4>
                    <div className="text-sm">
                      {paymentMethod === "cod" ? "Cash on Delivery" :
                       paymentMethod === "khalti" ? "Khalti" : "eSewa"}
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-medium mb-3">Shipping To</h4>
                    <p className="text-gray-800 leading-relaxed">{shippingInfo.address || "—"}</p>
                    <p className="text-gray-800 mt-1">Phone: {shippingInfo.phone || "—"}</p>
                    {shippingInfo.notes && (
                      <p className="text-gray-600 italic mt-2">Note: {shippingInfo.notes}</p>
                    )}
                  </div>

                  <div className="mt-10">
                    {paymentMethod === "cod" ? (
                      <button
                        onClick={handlePlaceOrderCOD}
                        disabled={isProcessing}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isProcessing ? "Processing..." : "Confirm & Place Order (COD)"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={isProcessing}
                        className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-50"
                      >
                        Pay with {paymentMethod === "khalti" ? "Khalti" : "eSewa"}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setStep(3)}
              className="text-sm text-gray-600 hover:text-emerald-700 flex items-center gap-1.5 transition"
            >
              <ChevronLeft size={16} /> Change Payment Method
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden">
            <div className="p-8 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-medium">Secure Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-3xl text-gray-500 hover:text-black"
                >
                  ×
                </button>
              </div>
              <p className="mt-2 text-gray-600">
                Amount: <strong>Rs {cartTotal.toLocaleString()}</strong> • {paymentMethod.toUpperCase()}
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center">
                <Lock className="w-12 h-12 mx-auto text-gray-800 mb-4" />
                <p className="text-lg font-medium">Complete your payment</p>
              </div>

              <div className="space-y-5">
                <input
                  type="text"
                  value={fakeWalletNumber}
                  onChange={(e) => setFakeWalletNumber(e.target.value)}
                  placeholder="Wallet / Mobile Number"
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 text-base"
                />
                <input
                  type="password"
                  value={fakeMpin}
                  onChange={(e) => setFakeMpin(e.target.value)}
                  placeholder="MPIN / Password"
                  maxLength={6}
                  className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 text-base"
                />
              </div>

              <button
                onClick={handleFakePayment}
                disabled={isProcessing}
                className={`w-full py-4 rounded-xl font-medium text-white transition
                  ${isProcessing ? "bg-gray-600 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {isProcessing ? "Processing..." : "Pay Now"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {renderStepper()}

          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-gray-900 mb-3">
            Checkout
          </h1>
          <p className="text-xl text-gray-600 mb-12">
            {cartCount} item{cartCount !== 1 && "s"} • Rs {cartTotal.toLocaleString()}
          </p>

          {renderStepContent()}
        </div>
      </div>
    </>
  );
}