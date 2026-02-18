import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import {
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MapPin,
  Package,
  AlertCircle,
  Wallet,
  CheckCircle,
  Lock,
  Smartphone,
  ChevronRight,
  ChevronLeft,
  ArrowLeft,
  Loader2,
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
  const [loading, setLoading] = useState(true);

  // Stock re-validation
  useEffect(() => {
    const validateCartStock = async () => {
      if (!cart.length) {
        setLoading(false);
        return;
      }

      let changed = false;
      const toRemove = [];

      for (const item of cart) {
        try {
          const res = await API.get(`/products/${item._id}`);
          const currentStock = res.data.stock || 0;

          if (currentStock < item.quantity) {
            if (currentStock <= 0) {
              toRemove.push(item._id);
            } else {
              updateQuantity(item._id, currentStock);
              changed = true;
              toast(`Adjusted ${item.name} to ${currentStock} (max available)`, {
                icon: <AlertCircle className="text-amber-600" />,
              });
            }
          }
        } catch (err) {
          console.warn("Stock check failed for:", item.name);
        }
      }

      if (toRemove.length) {
        toRemove.forEach((id) => removeFromCart(id));
        toast.error(`${toRemove.length} item(s) removed — out of stock now`);
      }

      setLoading(false);
    };

    validateCartStock();
  }, [cart, updateQuantity, removeFromCart]);

  const handleNextStep = () => {
    if (step === 2 && (!shippingInfo.address?.trim() || !shippingInfo.phone?.trim())) {
      return toast.error("Address and phone number are required");
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step === 1) {
      navigate("/marketplace");
    } else {
      setStep((prev) => Math.max(1, prev - 1));
    }
  };

  const handleFakePayment = async () => {
    if (!fakeWalletNumber.trim() || !fakeMpin.trim()) {
      return toast.error("Please enter wallet number and MPIN");
    }

    setIsProcessing(true);
    const toastId = toast.loading("Processing payment...");

    try {
      await new Promise((r) => setTimeout(r, 3800));

      const payload = {
        items: cart.map((i) => ({ _id: i._id, quantity: i.quantity })),
        shippingAddress: shippingInfo.address,
        phone: shippingInfo.phone,
        notes: shippingInfo.notes || undefined,
      };

      const res = await API.post("/orders", payload);

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
          total: res.data.order.totalAmount || cartTotal,
        },
      });
    } catch (err) {
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

      if (!res.data?.order?._id) {
        throw new Error("Order creation failed - no order ID returned");
      }

      toast.success("Order placed successfully (Cash on Delivery)", { id: toastId });
      clearCart();

      navigate("/order-success", {
        state: {
          orderId: res.data.order._id,
          total: res.data.order.totalAmount || cartTotal,
        },
      });
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to place order. Please try again.",
        { id: toastId }
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const OrderSummary = () => (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
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
          <span className="text-gray-600">Tax (13%)</span>
          <span className="font-medium">Rs {(cartTotal * 0.13).toLocaleString()}</span>
        </div>
        <div className="flex justify-between pt-5 border-t text-base font-medium">
          <span>Total (incl. tax)</span>
          <span className="text-emerald-700 font-bold">
            Rs {(cartTotal * 1.13).toLocaleString()}
          </span>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-8 leading-relaxed">
        Secure Checkout. By placing your order, you agree to our{" "}
        <span className="underline hover:text-emerald-700 cursor-pointer">Terms</span> and{" "}
        <span className="underline hover:text-emerald-700 cursor-pointer">Privacy Policy</span>.
      </p>
    </div>
  );

  const renderStepper = () => (
    <div className="mb-10 flex justify-center gap-10 md:gap-16">
      {["Cart", "Shipping", "Payment", "Confirm"].map((label, i) => {
        const isActive = step === i + 1;
        const isDone = step > i + 1;
        return (
          <div key={label} className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all
                ${isDone ? "bg-emerald-600 text-white border-emerald-600" :
                  isActive ? "border-emerald-600 text-emerald-600 bg-white" :
                  "border-gray-300 text-gray-400 bg-white"}`}
            >
              {isDone ? <CheckCircle size={20} /> : i + 1}
            </div>
            <span className={`mt-2 text-sm font-medium ${isActive || isDone ? "text-emerald-700" : "text-gray-500"}`}>
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
          <>
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-emerald-600" />
              </div>
            ) : cart.length === 0 ? (
              <div className="py-32 text-center bg-gray-50/50 rounded-2xl border border-gray-200">
                <Package className="mx-auto text-gray-300 mb-6" size={80} />
                <h3 className="text-2xl font-medium text-gray-800 mb-4">Your cart is empty</h3>
                <p className="text-gray-600 mb-8">Looks like you haven't added anything yet.</p>
                <button
                  onClick={() => navigate("/marketplace")}
                  className="px-10 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition shadow-md"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <div className="grid lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-8">
                  <div className="space-y-6">
                    {cart.map((item) => (
                      <div key={item._id} className="flex gap-6 py-6 border-b border-gray-100 last:border-0">
                        <div className="w-32 h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                          {item.image ? (
                            <img
                              src={`http://localhost:5000${item.image}`}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <Package size={48} />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <h3 className="font-semibold text-lg line-clamp-2">{item.name}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              Rs {item.pricePerUnit.toLocaleString()} per unit
                            </p>
                            {item.quantity > (getAvailableStock(item._id) ?? 999) * 0.7 && (
                              <p className="text-xs text-amber-600 mt-2 flex items-center gap-1.5">
                                <AlertCircle size={14} /> Limited stock — order soon
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between mt-4">
                            <div className="flex items-center border border-gray-200 rounded-full">
                              <button
                                onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-l-full transition disabled:opacity-50"
                                disabled={item.quantity <= 1}
                              >
                                <Minus size={18} />
                              </button>
                              <span className="w-12 text-center font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item._id, item.quantity + 1)}
                                className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-r-full transition"
                              >
                                <Plus size={18} />
                              </button>
                            </div>

                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="text-gray-400 hover:text-red-500 transition p-2"
                            >
                              <Trash2 size={20} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    <button
                      onClick={clearCart}
                      className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1.5 mt-4 transition"
                    >
                      <Trash2 size={16} /> Clear entire cart
                    </button>
                  </div>
                </div>

                <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit space-y-6">
                  <OrderSummary />

                  <button
                    onClick={() => setStep(2)}
                    className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
                  >
                    Proceed to Checkout <ArrowRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </>
        );

      case 2:
        return (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <h2 className="text-3xl font-medium text-gray-900">Shipping Details</h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                  <textarea
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    placeholder="House no., Street name, Area, City, Province"
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 resize-none text-base"
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    placeholder="98XXXXXXXX"
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-base"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes (optional)</label>
                  <textarea
                    value={shippingInfo.notes}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                    placeholder="Gate code, landmark, preferred time..."
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-base"
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
                  className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 text-base shadow-md"
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

      case 3:
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-3xl font-medium text-gray-900">Choose Payment Method</h2>

            <div className="grid gap-6 sm:grid-cols-3">
              {[
                { id: "khalti", name: "Khalti", icon: Wallet, color: "bg-purple-600" },
                { id: "esewa", name: "eSewa", icon: Smartphone, color: "bg-green-600" },
                { id: "cod", name: "Cash on Delivery", icon: MapPin, color: "bg-amber-600" },
              ].map(({ id, name, icon: Icon, color }) => (
                <button
                  key={id}
                  onClick={() => setPaymentMethod(id)}
                  className={`p-8 border-2 rounded-2xl text-center transition-all duration-300 hover:shadow-lg
                    ${paymentMethod === id
                      ? `border-${color.replace("bg-", "")} bg-gradient-to-br from-${color.replace("bg-", "")}/10 to-transparent`
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"}`}
                >
                  <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white shadow-md`}>
                    <Icon size={28} />
                  </div>
                  <div className="font-semibold text-lg">{name}</div>
                  {paymentMethod === id && (
                    <div className="text-sm text-emerald-600 mt-2 font-medium">Selected ✓</div>
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
                className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md"
              >
                Review & Confirm <ChevronRight size={18} />
              </button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="max-w-5xl mx-auto space-y-12">
            <h2 className="text-3xl font-medium text-gray-900">Confirm Your Order</h2>

            <div className="grid md:grid-cols-5 gap-10">
              <div className="md:col-span-3">
                <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow-sm">
                  <h3 className="font-medium text-xl mb-6">Order Items</h3>
                  <div className="space-y-6 divide-y divide-gray-100">
                    {cart.map((item) => (
                      <div key={item._id} className="flex justify-between items-center py-5 first:pt-0 last:pb-0">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden border border-gray-200 flex-shrink-0">
                            {item.image ? (
                              <img
                                src={`http://localhost:5000${item.image}`}
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package size={32} />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            <p className="text-sm text-gray-600 mt-1">
                              Qty: {item.quantity} × Rs {item.pricePerUnit.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <span className="font-bold text-lg">
                          Rs {(item.pricePerUnit * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="border border-gray-200 rounded-2xl p-8 bg-white shadow-sm sticky top-6">
                  <h3 className="font-medium text-xl mb-6">Order Summary</h3>

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
                      <span>Total (incl. 13% tax)</span>
                      <span className="text-emerald-700 font-bold">
                        Rs {(cartTotal * 1.13).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t">
                    <h4 className="font-medium mb-3">Payment Method</h4>
                    <div className="flex items-center gap-3 text-lg font-medium">
                      {paymentMethod === "cod" && <MapPin size={20} className="text-amber-600" />}
                      {paymentMethod === "khalti" && <Wallet size={20} className="text-purple-600" />}
                      {paymentMethod === "esewa" && <Smartphone size={20} className="text-green-600" />}
                      <span>
                        {paymentMethod === "cod" ? "Cash on Delivery" :
                         paymentMethod === "khalti" ? "Khalti" : "eSewa"}
                      </span>
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
                        className="w-full py-5 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 disabled:opacity-60 transition flex items-center justify-center gap-2 shadow-lg"
                      >
                        {isProcessing ? "Processing..." : "Confirm & Place Order (COD)"}
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowPaymentModal(true)}
                        disabled={isProcessing}
                        className="w-full py-5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 transition shadow-lg"
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
              className="text-sm text-gray-600 hover:text-emerald-700 flex items-center gap-1.5 transition mt-6"
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
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-8 border-b bg-gradient-to-r from-gray-50 to-white">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Secure Payment</h2>
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="text-3xl text-gray-500 hover:text-gray-900 transition"
                >
                  ×
                </button>
              </div>
              <p className="mt-2 text-gray-600">
                Amount: <strong className="text-emerald-700">Rs {cartTotal.toLocaleString()}</strong>
                <br />
                <span className="text-sm">via {paymentMethod.toUpperCase()}</span>
              </p>
            </div>

            <div className="p-8 space-y-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lock className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-lg font-medium text-gray-800">Complete your payment</p>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Wallet / Mobile Number</label>
                  <input
                    type="text"
                    value={fakeWalletNumber}
                    onChange={(e) => setFakeWalletNumber(e.target.value)}
                    placeholder="98XXXXXXXX"
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">MPIN / Password</label>
                  <input
                    type="password"
                    value={fakeMpin}
                    onChange={(e) => setFakeMpin(e.target.value)}
                    placeholder="••••••"
                    maxLength={6}
                    className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 text-base"
                  />
                </div>
              </div>

              <button
                onClick={handleFakePayment}
                disabled={isProcessing}
                className={`w-full py-5 rounded-xl font-medium text-white transition-all duration-300 shadow-lg
                  ${isProcessing ? "bg-gray-500 cursor-wait" : "bg-emerald-600 hover:bg-emerald-700"}`}
              >
                {isProcessing ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Processing...
                  </span>
                ) : (
                  "Pay Now Securely"
                )}
              </button>

              <p className="text-center text-xs text-gray-500 mt-4">
                Your payment is secure and encrypted
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* BACK BUTTON AT THE VERY TOP OF EVERYTHING */}
          <div className="mb-6">
            <button
              onClick={handlePrevStep}
              className="flex items-center gap-2 text-gray-700 hover:text-emerald-700 font-medium text-lg transition"
            >
              <ArrowLeft size={24} />
              {step === 1 ? "Back to Marketplace" : "Back"}
            </button>
          </div>

          {renderStepper()}

          <h1 className="text-5xl md:text-6xl font-medium tracking-tight text-gray-900 mb-4 text-center md:text-left">
            Checkout
          </h1>
          <p className="text-xl text-gray-600 mb-12 text-center md:text-left">
            {cartCount} item{cartCount !== 1 && "s"} • Rs {cartTotal.toLocaleString()}
          </p>

          {renderStepContent()}
        </div>
      </div>
    </>
  );
}