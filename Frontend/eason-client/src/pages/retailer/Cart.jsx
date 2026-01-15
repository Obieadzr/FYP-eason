// src/pages/retailer/Cart.jsx  → Modern Premium UI + Server-side check
import React, { useState, useEffect } from "react";
import { useCart } from "../../context/CartContext";
import { useNavigate } from "react-router-dom";
import { Trash2, Plus, Minus, ArrowRight, MapPin, Package, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import API from "../../utils/api";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, cartTotal, cartCount, clearCart, getAvailableStock } = useCart();
  const navigate = useNavigate();
  const [shippingInfo, setShippingInfo] = useState({ address: "", phone: "", notes: "" });
  const [isValidating, setIsValidating] = useState(false);

  // Auto-remove out-of-stock items when cart loads / refreshes
  useEffect(() => {
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
              // Adjust quantity to max available
              item.quantity = currentStock;
              changed = true;
              toast(`Adjusted ${item.name} quantity to ${currentStock} (max available)`, {
                icon: <AlertCircle className="text-orange-500" />,
                duration: 5000,
              });
            }
          }
        } catch (err) {
          console.warn("Could not validate stock for", item.name);
        }
      }

      if (toRemove.length > 0) {
        toRemove.forEach(id => removeFromCart(id));
        toast.error(`${toRemove.length} item(s) removed - out of stock`, { duration: 5000 });
      }

      if (changed) {
        // Update cart with adjusted quantities
        setCart(newCart.filter(item => !toRemove.includes(item._id)));
      }
    };

    validateCartStock();
  }, [cart, removeFromCart]);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (!shippingInfo.address?.trim() || !shippingInfo.phone?.trim()) {
      toast.error("Please provide delivery address and phone number");
      return;
    }

    setIsValidating(true);
    const toastId = toast.loading("Validating stock & creating order...");

    try {
      // Final server-side stock & price validation
      const orderPayload = {
        items: cart.map(item => ({
          _id: item._id,
          quantity: item.quantity,
        })),
        shippingAddress: shippingInfo.address,
        phone: shippingInfo.phone,
        notes: shippingInfo.notes,
      };

      const response = await API.post("/orders", orderPayload);

      toast.success("Order placed successfully!", { id: toastId });
      clearCart();

      navigate("/order-success", {
        state: {
          orderId: response.data.order._id,
          total: response.data.order.totalAmount,
        },
      });
    } catch (err) {
      const msg = err.response?.data?.message || "Failed to place order";
      toast.error(msg, { id: toastId });
    } finally {
      setIsValidating(false);
    }
  };

  // ── Premium UI ──────────────────────────────────────────────────────────────
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <div className="w-24 h-24 mx-auto bg-emerald-100 rounded-full flex items-center justify-center mb-8">
            <Package className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-lg text-gray-600 mb-10">Looks like you haven't added anything yet.</p>
          <button
            onClick={() => navigate("/marketplace")}
            className="px-12 py-5 bg-emerald-600 text-white font-semibold rounded-2xl hover:bg-emerald-700 transition shadow-lg text-lg"
          >
            Start Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-teal-50/30 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-3">Your Cart</h1>
        <p className="text-lg text-gray-600 mb-12">{cartCount} items • Ready to checkout</p>

        <div className="grid lg:grid-cols-3 gap-10 xl:gap-16">
          {/* Items - Premium Cards */}
          <div className="lg:col-span-2 space-y-6">
            {cart.map((item) => {
              const available = getAvailableStock(item._id, item.stock);
              const isLow = available > 0 && available < 5;

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex flex-col sm:flex-row">
                    <div className="sm:w-48 h-48 flex-shrink-0">
                      {item.image ? (
                        <img
                          src={`http://localhost:5000${item.image}`}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                          <Package className="w-16 h-16 text-gray-300" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 p-6 flex flex-col">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {item.category?.name} • {item.unit?.name}
                          </p>
                        </div>
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="p-2 hover:bg-red-50 rounded-lg text-red-600 transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>

                      <div className="mt-6 flex items-center justify-between flex-wrap gap-4">
                        <div>
                          <p className="text-2xl font-bold text-emerald-600">
                            Rs {item.pricePerUnit.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-500">per unit</p>
                        </div>

                        <div className="flex items-center gap-4">
                          <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity - 1)}
                              className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={18} />
                            </button>
                            <span className="px-6 py-3 font-semibold text-lg w-16 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item._id, item.quantity + 1)}
                              className="px-4 py-3 bg-gray-50 hover:bg-gray-100 transition"
                              disabled={item.quantity >= available}
                            >
                              <Plus size={18} />
                            </button>
                          </div>

                          {isLow && (
                            <span className="text-xs font-medium px-3 py-1 bg-orange-100 text-orange-700 rounded-full">
                              Only {available} left!
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 text-right">
                        <p className="text-xl font-bold text-gray-900">
                          Rs {(item.pricePerUnit * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Premium Checkout Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sticky top-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Order Summary</h2>

              <div className="space-y-5 mb-10">
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Subtotal</span>
                  <span className="font-semibold">Rs {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="text-gray-700">Shipping</span>
                  <span className="text-emerald-600 font-semibold">Free</span>
                </div>
                <div className="pt-5 border-t">
                  <div className="flex justify-between text-2xl font-bold">
                    <span>Total</span>
                    <span className="text-emerald-700">Rs {cartTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Delivery Address
                  </label>
                  <input
                    type="text"
                    value={shippingInfo.address}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, address: e.target.value })}
                    placeholder="Full delivery address"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={shippingInfo.phone}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                    placeholder="9800000000"
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Order Notes (optional)
                  </label>
                  <textarea
                    value={shippingInfo.notes}
                    onChange={(e) => setShippingInfo({ ...shippingInfo, notes: e.target.value })}
                    placeholder="Special instructions..."
                    rows={3}
                    className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
                  />
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={isValidating || cartCount === 0}
                className="mt-10 w-full py-5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-semibold text-lg rounded-2xl hover:from-emerald-700 hover:to-teal-700 transition-all shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                {isValidating ? (
                  <>
                    <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></span>
                    Processing...
                  </>
                ) : (
                  <>
                    <ArrowRight size={22} />
                    Place Order
                  </>
                )}
              </button>

              <p className="text-center text-sm text-gray-500 mt-6">
                Secure checkout • Free shipping • Easy returns
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}