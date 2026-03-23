import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, MapPin, Package, AlertCircle, Wallet, CheckCircle, Lock, Smartphone, ChevronRight, ChevronLeft, ArrowLeft, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import API from "../../utils/api";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart, getAvailableStock } = useCart();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [shippingInfo, setShippingInfo] = useState({ address: "", phone: "", notes: "" });
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [isProcessing, setIsProcessing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [fakeWalletNumber, setFakeWalletNumber] = useState("");
  const [fakeMpin, setFakeMpin] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const validateCartStock = async () => {
      if (!cart.length) return setLoading(false);
      let changed = false;
      const toRemove = [];
      for (const item of cart) {
        try {
          const res = await API.get(`/products/${item._id}`);
          const currentStock = res.data.stock || 0;
          if (currentStock < item.quantity) {
            if (currentStock <= 0) toRemove.push(item._id);
            else {
              updateQuantity(item._id, currentStock);
              changed = true;
              toast(`Adjusted ${item.name} to ${currentStock} (max available)`, { icon: <AlertCircle className="text-amber-600" /> });
            }
          }
        } catch (err) {}
      }
      if (toRemove.length) { toRemove.forEach((id) => removeFromCart(id)); toast.error(`${toRemove.length} item(s) removed — out of stock now`); }
      setLoading(false);
    };
    validateCartStock();
  }, [cart, updateQuantity, removeFromCart]);

  const handleNextStep = () => {
    if (step === 2 && (!shippingInfo.address?.trim() || !shippingInfo.phone?.trim())) return toast.error("Address and phone number are required");
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step === 1) navigate("/marketplace");
    else setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFakePayment = async () => {
    if (!fakeWalletNumber.trim() || !fakeMpin.trim()) return toast.error("Please enter wallet number and MPIN");
    setIsProcessing(true);
    const toastId = toast.loading("Processing payment...");
    try {
      await new Promise((r) => setTimeout(r, 3800));
      const payload = { items: cart.map((i) => ({ _id: i._id, quantity: i.quantity })), shippingAddress: shippingInfo.address, phone: shippingInfo.phone, notes: shippingInfo.notes || undefined, paymentMethod };
      const res = await API.post("/orders", payload);
      toast.success("Payment successful! Order placed.", { id: toastId });
      clearCart();
      setShowPaymentModal(false);
      navigate("/order-success", { state: { orderId: res.data.order._id, total: res.data.order.totalAmount || cartTotal } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment / order failed.", { id: toastId });
    } finally { setIsProcessing(false); }
  };

  const handlePlaceOrderCOD = async () => {
    setIsProcessing(true);
    const toastId = toast.loading("Placing order...");
    try {
      const payload = { items: cart.map((i) => ({ _id: i._id, quantity: i.quantity })), shippingAddress: shippingInfo.address, phone: shippingInfo.phone, notes: shippingInfo.notes || undefined, paymentMethod };
      const res = await API.post("/orders", payload);
      toast.success("Order placed successfully (Cash on Delivery)", { id: toastId });
      clearCart();
      navigate("/order-success", { state: { orderId: res.data.order._id, total: res.data.order.totalAmount || cartTotal } });
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to place order.", { id: toastId });
    } finally { setIsProcessing(false); }
  };

  const OrderSummary = () => (
    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm">
      <h3 className="text-lg font-medium mb-6 text-gray-900">Order Summary</h3>
      <div className="space-y-4 text-sm">
        <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span className="font-medium">Rs {cartTotal.toLocaleString()}</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Estimated Delivery & Handling</span><span className="text-emerald-600 font-medium">Free</span></div>
        <div className="flex justify-between"><span className="text-gray-600">Tax (13%)</span><span className="font-medium">Rs {(cartTotal * 0.13).toLocaleString()}</span></div>
        <div className="flex justify-between pt-5 border-t text-base font-medium"><span>Total (incl. tax)</span><span className="text-emerald-700 font-bold">Rs {(cartTotal * 1.13).toLocaleString()}</span></div>
      </div>
    </div>
  );

  const renderStepper = () => (
    <div className="mb-10 flex justify-center gap-10 md:gap-16">
      {["Cart", "Shipping", "Payment", "Confirm"].map((label, i) => {
        const isActive = step === i + 1;
        const isDone = step > i + 1;
        return (
          <div key={label} className="flex flex-col items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${isDone ? "bg-emerald-600 text-white border-emerald-600" : isActive ? "border-emerald-600 text-emerald-600 bg-white" : "border-gray-300 text-gray-400 bg-white"}`}>
              {isDone ? <CheckCircle size={20} /> : i + 1}
            </div>
            <span className={`mt-2 text-sm font-medium ${isActive || isDone ? "text-emerald-700" : "text-gray-500"}`}>{label}</span>
          </div>
        );
      })}
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return loading ? (
          <div className="flex justify-center items-center h-64"><Loader2 className="w-12 h-12 animate-spin text-emerald-600" /></div>
        ) : cart.length === 0 ? (
          <div className="py-32 text-center bg-gray-50/50 rounded-2xl border border-gray-200">
            <Package className="mx-auto text-gray-300 mb-6" size={80} />
            <h3 className="text-2xl font-medium text-gray-800 mb-4">Your cart is empty</h3>
            <button onClick={() => navigate("/marketplace")} className="px-10 py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition shadow-md">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-8">
              <div className="space-y-6">
                {cart.map((item) => (
                  <div key={item._id} className="flex gap-6 py-6 border-b border-gray-100">
                    <div className="w-32 h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-200">
                      {item.image ? <img src={`http://localhost:5000${item.image}`} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-300"><Package size={48} /></div>}
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">Rs {item.pricePerUnit.toLocaleString()} / unit</p>
                      </div>
                      <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center border border-gray-200 rounded-full">
                          <button onClick={() => updateQuantity(item._id, Math.max(1, item.quantity - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-l-full transition disabled:opacity-50" disabled={item.quantity <= 1}><Minus size={18} /></button>
                          <span className="w-12 text-center font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-gray-100 rounded-r-full transition"><Plus size={18} /></button>
                        </div>
                        <button onClick={() => removeFromCart(item._id)} className="text-gray-400 hover:text-red-500 transition p-2"><Trash2 size={20} /></button>
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={clearCart} className="text-sm text-gray-500 hover:text-red-600 flex items-center gap-1.5 mt-4 transition">
                  <Trash2 size={16} /> Clear entire cart
                </button>
              </div>
            </div>
            <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit space-y-6">
              <OrderSummary />
              <button onClick={() => setStep(2)} className="w-full py-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-md">
                Proceed to Checkout <ArrowRight size={18} />
              </button>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="grid lg:grid-cols-12 gap-10">
            <div className="lg:col-span-8 space-y-10">
              <h2 className="text-3xl font-medium text-gray-900">Shipping Details</h2>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address *</label>
                  <textarea value={shippingInfo.address} onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })} className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" rows={4} required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number *</label>
                  <input type="tel" value={shippingInfo.phone} onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })} className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Notes (optional)</label>
                  <textarea value={shippingInfo.notes} onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })} className="w-full px-5 py-4 border border-gray-200 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" rows={2} />
                </div>
              </div>
              <div className="flex gap-5 pt-8">
                <button onClick={handlePrevStep} className="flex-1 py-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50">Back to Cart</button>
                <button onClick={handleNextStep} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-medium">Continue</button>
              </div>
            </div>
            <div className="lg:col-span-4 lg:sticky lg:top-10 h-fit"><OrderSummary /></div>
          </div>
        );
      case 3:
        return (
          <div className="max-w-4xl mx-auto space-y-12">
            <h2 className="text-3xl font-medium text-gray-900">Choose Payment Method</h2>
            <div className="grid gap-6 sm:grid-cols-3">
              {[{ id: "khalti", name: "Khalti", icon: Wallet, color: "bg-purple-600" }, { id: "esewa", name: "eSewa", icon: Smartphone, color: "bg-green-600" }, { id: "cod", name: "Cash on Delivery", icon: MapPin, color: "bg-amber-600" }].map(({ id, name, icon: Icon, color }) => (
                <button key={id} onClick={() => setPaymentMethod(id)} className={`p-8 border-2 rounded-2xl text-center ${paymentMethod === id ? `border-${color.replace("bg-","")} bg-gradient-to-br from-${color.replace("bg-","")}/10` : "border-gray-200"}`}>
                  <div className={`w-16 h-16 ${color} rounded-2xl flex items-center justify-center mx-auto mb-4 text-white`}><Icon size={28} /></div>
                  <div className="font-semibold text-lg">{name}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-5 pt-8">
              <button onClick={handlePrevStep} className="flex-1 py-4 border border-gray-300 rounded-xl font-medium hover:bg-gray-50">Back</button>
              <button onClick={() => setStep(4)} className="flex-1 py-4 bg-emerald-600 text-white rounded-xl font-medium">Review & Confirm</button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="max-w-5xl mx-auto space-y-12">
            <h2 className="text-3xl font-medium text-gray-900">Confirm Your Order</h2>
            <div className="grid md:grid-cols-5 gap-10">
              <div className="md:col-span-3 border border-gray-200 rounded-2xl p-8 bg-white">
                <h3 className="font-medium text-xl mb-6">Order Items</h3>
                {cart.map((item) => (
                  <div key={item._id} className="flex justify-between items-center py-5">
                    <div className="flex items-center gap-5">
                      <div className="w-20 h-20 bg-gray-50 rounded-xl border border-gray-200">{/* img or package icon */}</div>
                      <div>
                        <p className="font-semibold">{item.name}</p>
                        <p className="text-sm">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    <span className="font-bold">Rs {(item.pricePerUnit * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="md:col-span-2 space-y-4">
                 <OrderSummary />
                 {paymentMethod === "cod" ? (
                   <button onClick={handlePlaceOrderCOD} className="w-full py-5 bg-emerald-600 text-white rounded-xl">Confirm Order (COD)</button>
                 ) : (
                   <button onClick={() => setShowPaymentModal(true)} className="w-full py-5 bg-purple-600 text-white rounded-xl">Pay Securely</button>
                 )}
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-10 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={handlePrevStep} className="mb-6 flex items-center gap-2 text-gray-700"><ArrowLeft /> Back</button>
        {renderStepper()}
        <h1 className="text-5xl md:text-6xl font-medium text-gray-900 mb-12 text-center">Checkout</h1>
        {renderStepContent()}
      </div>
    </div>
  );
}